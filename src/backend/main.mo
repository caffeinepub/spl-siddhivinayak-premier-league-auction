import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type TeamId = Nat;
  type PlayerId = Nat;
  type Amount = Nat;
  type Rating = Nat;
  type Category = {
    #batsman;
    #bowler;
    #allrounder;
  };
  type Status = {
    #upcoming;
    #live;
    #sold;
  };
  type TeamLogo = ?Storage.ExternalBlob;
  type Team = {
    id : TeamId;
    name : Text;
    purseAmountTotal : Amount;
    purseAmountLeft : Amount;
    numberOfPlayers : Nat;
    ownerName : Text;
    teamIconPlayer : Text;
    isTeamLocked : Bool;
    teamLogo : TeamLogo;
  };
  type Player = {
    id : PlayerId;
    name : Text;
    category : Category;
    basePrice : Amount;
    imageUrl : Text;
    soldPrice : ?Amount;
    soldTo : ?TeamId;
    status : Status;
    rating : Rating;
  };

  type AuctionState = {
    currentPlayerId : ?PlayerId;
    currentBid : Amount;
    leadingTeamId : ?TeamId;
    isActive : Bool;
  };

  type Result = {
    #ok;
    #err : Text;
  };

  type Dashboard = {
    totalSpent : Amount;
    mostExpensivePlayer : ?Player;
    remainingPlayers : Nat;
    soldPlayers : Nat;
  };

  type PlayerWithTeam = {
    player : Player;
    team : ?Team;
  };

  let teams = Map.empty<TeamId, Team>();
  let players = Map.empty<PlayerId, Player>();

  var auctionState : AuctionState = {
    currentPlayerId = null;
    currentBid = 0;
    leadingTeamId = null;
    isActive = false;
  };

  var nextPlayerId = 20;

  //------------------------------------
  // Helper Functions
  //------------------------------------

  public shared ({ caller }) func initialize() : async Bool {
    nextPlayerId := 20;
    true;
  };

  func updatePlayerStatus(playerId : PlayerId, status : Status) {
    switch (players.get(playerId)) {
      case (?player) {
        let updatedPlayer = { player with status };
        players.add(playerId, updatedPlayer);
      };
      case (null) {};
    };
  };

  func calculateRemainingRequirement(team : Team) : Amount {
    let playersNeeded = 7 - team.numberOfPlayers;
    playersNeeded * 100;
  };

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

  public query ({ caller }) func getDashboard() : async Dashboard {
    let allPlayers = players.values().toList<Player>();

    var totalSpent = 0;
    var mostExpensivePrice = 0;
    var mostExpensivePlayer : ?Player = null;

    let remainingPlayers = allPlayers.filter(
      func(player) { player.status == #upcoming }
    ).size();

    let soldPlayers = allPlayers.filter(
      func(player) { player.status == #sold }
    ).size();

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

  public query ({ caller }) func getTeamById(teamId : TeamId) : async ?Team {
    teams.get(teamId);
  };

  public query ({ caller }) func getPlayerById(playerId : PlayerId) : async ?Player {
    players.get(playerId);
  };

  public query ({ caller }) func getResults() : async [PlayerWithTeam] {
    let soldPlayers = List.fromIter<Player>(players.values());
    let filteredSoldPlayers = soldPlayers.filter(
      func(player) { player.status == #sold }
    );

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

  //------------------------------------
  // Auction Functions
  //------------------------------------

  public shared ({ caller }) func selectPlayer(playerId : PlayerId) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        if (player.status != #upcoming) {
          #err("Player is not available for auction");
        } else {
          updatePlayerStatus(playerId, #live);
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

  public shared ({ caller }) func placeBid(teamId : TeamId) : async Result {
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
              status = #sold;
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

  public shared ({ caller }) func unsellPlayer(playerId : PlayerId) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        switch (player.status) {
          case (#sold) {
            switch (player.soldPrice) {
              case (?finalPrice) {
                switch (player.soldTo) {
                  case (?teamId) {
                    switch (teams.get(teamId)) {
                      case (?team) {
                        let updatedTeam = {
                          team with
                          purseAmountLeft = team.purseAmountLeft + finalPrice;
                          numberOfPlayers = team.numberOfPlayers - 1;
                          isTeamLocked = false;
                        };

                        teams.add(teamId, updatedTeam);

                        let updatedPlayer = {
                          player with
                          soldPrice = null;
                          soldTo = null;
                          status = #upcoming;
                        };

                        players.add(playerId, updatedPlayer);

                        #ok;
                      };
                      case (null) { #err("Team not found") };
                    };
                  };
                  case (null) { #err("Invalid team data") };
                };
              };
              case (null) { #err("Invalid price data") };
            };
          };
          case (_) { #err("Player can only be unsold if status is sold") };
        };
      };
      case (null) { #err("Player not found") };
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
        status = #upcoming;
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

  public shared ({ caller }) func editTeamPurse(teamId : TeamId, newPurse : Amount) : async Result {
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

  public shared ({ caller }) func updateTeam(teamId : TeamId, name : Text, ownerName : Text, iconPlayerName : Text) : async Result {
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

  public shared ({ caller }) func uploadTeamLogo(teamId : TeamId, blob : Storage.ExternalBlob) : async Result {
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

  public shared ({ caller }) func addPlayer(name : Text, category : Category, basePrice : Amount, imageUrl : Text, rating : Rating) : async Result {
    let player : Player = {
      id = nextPlayerId;
      name;
      category;
      basePrice;
      imageUrl;
      soldPrice = null;
      soldTo = null;
      status = #upcoming;
      rating;
    };
    players.add(nextPlayerId, player);
    nextPlayerId += 1;
    #ok;
  };

  public shared ({ caller }) func updatePlayer(playerId : PlayerId, name : Text, category : Category, basePrice : Amount, imageUrl : Text, rating : Rating) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        if (player.status == #live) {
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

  public shared ({ caller }) func deletePlayer(playerId : PlayerId) : async Result {
    switch (players.get(playerId)) {
      case (?player) {
        if (player.status == #live) {
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

  public query ({ caller }) func getPlayersByCategory(category : Category) : async [Player] {
    let filteredPlayers = players.values().toList<Player>().filter(
      func(player) { player.category == category }
    );
    filteredPlayers.toArray();
  };

  public query ({ caller }) func getRemainingPurse(teamId : TeamId) : async ?Amount {
    switch (teams.get(teamId)) {
      case (?team) { ?team.purseAmountLeft };
      case (null) { null };
    };
  };
};
