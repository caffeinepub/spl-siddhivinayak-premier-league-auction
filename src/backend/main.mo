import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type Team = {
    id : Nat;
    name : Text;
    purseAmountTotal : Nat;
    purseAmountLeft : Nat;
    numberOfPlayers : Nat;
    ownerName : Text;
    teamIconPlayer : Text;
    isTeamLocked : Bool;
    teamLogo : ?Storage.ExternalBlob;
  };

  type Player = {
    id : Nat;
    name : Text;
    category : Text;
    basePrice : Nat;
    imageUrl : Text;
    soldPrice : ?Nat;
    soldTo : ?Nat;
    status : Text;
    rating : Nat;
  };

  type AuctionState = {
    currentPlayerId : ?Nat;
    currentBid : Nat;
    leadingTeamId : ?Nat;
    isActive : Bool;
  };

  type Result = { #ok; #err : Text };

  type Dashboard = {
    totalSpent : Nat;
    mostExpensivePlayer : ?Player;
    remainingPlayers : Nat;
    soldPlayers : Nat;
  };

  type PlayerWithTeam = {
    player : Player;
    team : ?Team;
  };

  let teams = Map.empty<Nat, Team>();
  let players = Map.empty<Nat, Player>();

  var auctionState : AuctionState = {
    currentPlayerId = null;
    currentBid = 0;
    leadingTeamId = null;
    isActive = false;
  };

  var nextPlayerId = 1;

  func seedTeams() {
    let teamData : [(Nat, Text, Text, Text)] = [
      (1, "Mumbai Warriors", "Rohit Sharma", "Virat Kohli"),
      (2, "Chennai Kings", "MS Dhoni", "Ravindra Jadeja"),
      (3, "Delhi Capitals", "Rishabh Pant", "Shikhar Dhawan"),
      (4, "Bangalore Challengers", "Virat Kohli", "AB de Villiers"),
      (5, "Kolkata Knight Riders", "Dinesh Karthik", "Andre Russell"),
      (6, "Punjab Kings", "KL Rahul", "Chris Gayle"),
      (7, "Hyderabad Sunrisers", "David Warner", "Kane Williamson"),
      (8, "Jaipur Royals", "Sanju Samson", "Jos Buttler"),
      (9, "Lucknow Super Giants", "KL Rahul", "Marcus Stoinis"),
      (10, "Gujarat Titans", "Hardik Pandya", "Shubman Gill"),
    ];

    for ((id, name, owner, icon) in teamData.values()) {
      let team : Team = {
        id;
        name;
        purseAmountTotal = 20500; // Including 5% extra for fees/deductions
        purseAmountLeft = 20000;
        numberOfPlayers = 0;
        ownerName = owner;
        teamIconPlayer = icon;
        isTeamLocked = false;
        teamLogo = null;
      };
      teams.add(id, team);
    };
  };

  func seedPlayers() {
    let playerData : [(Text, Text, Nat, Text, Nat)] = [
      ("Rohit Sharma", "Batsman", 300, "url1", 5),
      ("Jasprit Bumrah", "Bowler", 300, "url2", 4),
      ("Surya Yadav", "Batsman", 200, "url3", 4),
      ("Ishan Kishan", "Batsman", 200, "url4", 3),
      ("Hardik Pandya", "Allrounder", 300, "url5", 5),
      ("Rahul Chahar", "Bowler", 100, "url6", 3),
      ("Trent Boult", "Bowler", 300, "url7", 4),
      ("Krunal Pandya", "Allrounder", 200, "url8", 3),
      ("Kieron Pollard", "Allrounder", 300, "url9", 5),
      ("Nathan Coulter-Nile", "Allrounder", 100, "url10", 3),
    ];

    for ((name, category, basePrice, imageUrl, rating) in playerData.values()) {
      let player = {
        id = nextPlayerId;
        name;
        category;
        basePrice;
        imageUrl;
        soldPrice = null;
        soldTo = null;
        status = "upcoming";
        rating;
      };
      players.add(nextPlayerId, player);
      nextPlayerId += 1;
    };
  };

  func updatePlayerStatus(playerId : Nat, status : Text) {
    switch (players.get(playerId)) {
      case (?player) {
        let updatedPlayer = { player with status };
        players.add(playerId, updatedPlayer);
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  func calculateRemainingRequirement(team : Team) : Nat {
    let playersNeeded = 7 - team.numberOfPlayers;
    playersNeeded * 100;
  };

  // Initialization
  seedTeams();
  seedPlayers();

  //------------------------------------
  // Query Functions
  //------------------------------------

  public shared ({ caller }) func adminLogin(password : Text) : async Bool {
    password == "SPL@2026";
  };

  public query ({ caller }) func getTeams() : async [Team] {
    teams.values().toArray();
  };

  public query ({ caller }) func getPlayers() : async [Player] {
    players.values().toArray();
  };

  public query ({ caller }) func getAuctionState() : async AuctionState {
    auctionState;
  };

  public query ({ caller }) func getResults() : async [PlayerWithTeam] {
    let soldPlayers = players.values().toList<Player>();
    let filteredSoldPlayers = soldPlayers.filter(func(player) { player.status == "sold" });

    let results = List.empty<PlayerWithTeam>();
    for (player in filteredSoldPlayers.values()) {
      let team = switch (player.soldTo) {
        case (null) { null };
        case (?teamId) { teams.get(teamId) };
      };
      results.add({ player; team });
    };
    results.toArray();
  };

  public query ({ caller }) func getDashboard() : async Dashboard {
    let allPlayers = players.values().toList<Player>();

    var totalSpent = 0;
    var mostExpensivePrice = 0;
    var mostExpensivePlayer : ?Player = null;

    let remainingPlayers = allPlayers.filter(func(player) { player.status == "upcoming" }).size();
    let soldPlayers = allPlayers.filter(func(player) { player.status == "sold" }).size();

    allPlayers.values().forEach(
      func(player) {
        switch (player.soldPrice) {
          case (?price) {
            totalSpent += price;
            if (price > mostExpensivePrice) {
              mostExpensivePrice := price;
              mostExpensivePlayer := ?player;
            };
          };
          case (null) {};
        };
      }
    );

    {
      totalSpent;
      mostExpensivePlayer;
      remainingPlayers;
      soldPlayers;
    };
  };

  public query ({ caller }) func getTeamById(teamId : Nat) : async ?Team {
    teams.get(teamId);
  };

  public query ({ caller }) func getPlayerById(playerId : Nat) : async ?Player {
    players.get(playerId);
  };

  //------------------------------------
  // Auction Functions
  //------------------------------------

  public shared ({ caller }) func selectPlayer(playerId : Nat) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        if (player.status != "upcoming") {
          #err("Player is not available for auction");
        } else {
          updatePlayerStatus(playerId, "live");
          auctionState := {
            auctionState with
            currentPlayerId = ?playerId;
            currentBid = player.basePrice;
            leadingTeamId = null;
            isActive = true;
          };
          #ok;
        };
      };
      case (null) { #err("Player not found") };
    };
  };

  public shared ({ caller }) func placeBid(teamId : Nat) : async Result {
    switch (teams.get(teamId)) {
      case (?team) {
        if (team.isTeamLocked) {
          return #err("Team is already locked");
        };

        let newBid = auctionState.currentBid + 100;
        if (team.purseAmountLeft < newBid) {
          return #err("Insufficient funds for this bid");
        };

        let remainingRequirement = calculateRemainingRequirement(team);
        if (
          team.purseAmountLeft - newBid < remainingRequirement
        ) {
          return #err("Bid would violate remaining purse requirements");
        };

        auctionState := {
          auctionState with
          currentBid = newBid;
          leadingTeamId = ?teamId;
        };

        #ok;
      };
      case (null) { #err("Team not found") };
    };
  };

  public shared ({ caller }) func sellPlayer() : async Result {
    if (not auctionState.isActive) {
      return #err("No active auction");
    };

    switch (
      (auctionState.currentPlayerId, auctionState.leadingTeamId)
    ) {
      case (?playerId, ?teamId) {
        switch ((players.get(playerId), teams.get(teamId))) {
          case (?player, ?team) {
            let updatedTeam = {
              team with
              purseAmountLeft = team.purseAmountLeft - auctionState.currentBid;
              numberOfPlayers = team.numberOfPlayers + 1;
              isTeamLocked = team.numberOfPlayers + 1 == 7;
            };
            teams.add(teamId, updatedTeam);

            let updatedPlayer = {
              player with
              soldPrice = ?auctionState.currentBid;
              soldTo = ?teamId;
              status = "sold";
            };
            players.add(playerId, updatedPlayer);

            auctionState := {
              currentPlayerId = null;
              currentBid = 0;
              leadingTeamId = null;
              isActive = false;
            };

            #ok;
          };
          case (null, _) { #err("Player not found") };
          case (_, null) { #err("Team not found") };
        };
      };
      case (_) { #err("Invalid auction state") };
    };
  };

  //------------------------------------
  // Admin Functions
  //------------------------------------

  public shared ({ caller }) func resetAuction() : async () {
    for ((id, team) in teams.entries()) {
      let resetTeam = {
        team with
        purseAmountLeft = 20000;
        numberOfPlayers = 0;
        isTeamLocked = false;
      };
      teams.add(id, resetTeam);
    };

    for ((id, player) in players.entries()) {
      let resetPlayer = {
        player with
        status = "upcoming";
        soldPrice = null;
        soldTo = null;
      };
      players.add(id, resetPlayer);
    };

    auctionState := {
      currentPlayerId = null;
      currentBid = 0;
      leadingTeamId = null;
      isActive = false;
    };
  };

  public shared ({ caller }) func editTeamPurse(teamId : Nat, newPurse : Nat) : async Result {
    switch (teams.get(teamId)) {
      case (?team) {
        let updatedTeam = { team with purseAmountLeft = newPurse };
        teams.add(teamId, updatedTeam);
        #ok;
      };
      case (null) { #err("Team not found") };
    };
  };

  //------------------------------------
  // Team Management
  //------------------------------------

  public shared ({ caller }) func updateTeam(teamId : Nat, name : Text, ownerName : Text, iconPlayerName : Text) : async Result {
    switch (teams.get(teamId)) {
      case (?team) {
        let updatedTeam = {
          team with
          name;
          ownerName;
          teamIconPlayer = iconPlayerName;
        };
        teams.add(teamId, updatedTeam);
        #ok;
      };
      case (null) { #err("Team not found") };
    };
  };

  public shared ({ caller }) func uploadTeamLogo(teamId : Nat, blob : Storage.ExternalBlob) : async Result {
    switch (teams.get(teamId)) {
      case (?team) {
        let updatedTeam = { team with teamLogo = ?blob };
        teams.add(teamId, updatedTeam);
        #ok;
      };
      case (null) { #err("Team not found") };
    };
  };

  //------------------------------------
  // Player Management
  //------------------------------------

  public shared ({ caller }) func addPlayer(name : Text, category : Text, basePrice : Nat, imageUrl : Text, rating : Nat) : async Result {
    let player = {
      id = nextPlayerId;
      name;
      category;
      basePrice;
      imageUrl;
      soldPrice = null;
      soldTo = null;
      status = "upcoming";
      rating;
    };
    players.add(nextPlayerId, player);
    nextPlayerId += 1;
    #ok;
  };

  public shared ({ caller }) func updatePlayer(playerId : Nat, name : Text, category : Text, basePrice : Nat, imageUrl : Text, rating : Nat) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        if (player.status == "live") {
          return #err("Cannot update player during live auction");
        };
        let updatedPlayer = {
          player with
          name;
          category;
          basePrice;
          imageUrl;
          rating;
        };
        players.add(playerId, updatedPlayer);
        #ok;
      };
      case (null) { #err("Player not found") };
    };
  };

  public shared ({ caller }) func deletePlayer(playerId : Nat) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        if (player.status == "live") {
          return #err("Cannot delete player during live auction");
        };
        players.remove(playerId);
        #ok;
      };
      case (null) { #err("Player not found") };
    };
  };

  //------------------------------------
  // Additional Helper Functions
  //------------------------------------

  public query ({ caller }) func getPlayersByCategory(category : Text) : async [Player] {
    let filteredPlayers = players.values().toList<Player>().filter(
      func(player) { Text.equal(player.category, category) }
    );
    filteredPlayers.toArray();
  };

  public query ({ caller }) func getRemainingPurse(teamId : Nat) : async ?Nat {
    switch (teams.get(teamId)) {
      case (?team) { ?team.purseAmountLeft };
      case (null) { null };
    };
  };

  //------------------------------------
  // Player Image Upload (future enhancement)
  //------------------------------------
  /*
  public shared ({ caller }) func uploadPlayerImage(playerId : Nat, blob : ExternalBlob) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        let updatedPlayer = { player with imageUrl = blob.id };
        players.add(playerId, updatedPlayer);
        #ok;
      };
      case (null) { #err("Player not found") };
    };
  };
  */
};
