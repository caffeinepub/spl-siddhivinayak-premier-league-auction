import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import List "mo:core/List";

module {
  type TeamId = Nat;
  type PlayerId = Nat;
  type Amount = Nat;
  type Rating = Nat;

  type OldActor = {
    teams : Map.Map<Nat, OldTeam>;
    players : Map.Map<Nat, OldPlayer>;
    auctionState : OldAuctionState;
    nextPlayerId : Nat;
  };

  type OldTeam = {
    id : TeamId;
    name : Text;
    purseAmountTotal : Amount;
    purseAmountLeft : Amount;
    numberOfPlayers : Nat;
    ownerName : Text;
    teamIconPlayer : Text;
    isTeamLocked : Bool;
    teamLogo : ?Storage.ExternalBlob;
  };

  type OldPlayer = {
    id : PlayerId;
    name : Text;
    category : Text;
    basePrice : Amount;
    imageUrl : Text;
    soldPrice : ?Amount;
    soldTo : ?TeamId;
    status : Text;
    rating : Nat;
  };

  type OldAuctionState = {
    currentPlayerId : ?PlayerId;
    currentBid : Amount;
    leadingTeamId : ?TeamId;
    isActive : Bool;
  };

  type NewActor = {
    teams : Map.Map<Nat, Team>;
    players : Map.Map<Nat, Player>;
    auctionState : AuctionState;
    nextPlayerId : Nat;
  };

  type Team = {
    id : TeamId;
    name : Text;
    purseAmountTotal : Amount;
    purseAmountLeft : Amount;
    numberOfPlayers : Nat;
    ownerName : Text;
    teamIconPlayer : Text;
    isTeamLocked : Bool;
    teamLogo : ?Storage.ExternalBlob;
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

  type Status = {
    #upcoming;
    #live;
    #sold;
  };
  type Category = {
    #batsman;
    #bowler;
    #allrounder;
  };

  type AuctionState = {
    currentPlayerId : ?PlayerId;
    currentBid : Amount;
    leadingTeamId : ?TeamId;
    isActive : Bool;
  };

  func toCategory(text : Text) : Category {
    switch (text) {
      case ("Batsman") { #batsman };
      case ("Bowler") { #bowler };
      case ("Allrounder") { #allrounder };
      case (_) { #batsman };
    };
  };

  func toStatus(text : Text) : Status {
    switch (text) {
      case ("upcoming") { #upcoming };
      case ("live") { #live };
      case ("sold") { #sold };
      case (_) { #upcoming };
    };
  };

  func clampRating(rating : Nat) : Rating {
    if (rating < 1) {
      return 1;
    } else if (rating > 5) { 5 } else { rating };
  };

  func convertPlayers(oldPlayers : Map.Map<Nat, OldPlayer>) : Map.Map<Nat, Player> {
    oldPlayers.map(
      func(_oldId, oldPlayer) {
        {
          id = oldPlayer.id;
          name = oldPlayer.name;
          category = toCategory(oldPlayer.category);
          basePrice = oldPlayer.basePrice;
          imageUrl = oldPlayer.imageUrl;
          soldPrice = oldPlayer.soldPrice;
          soldTo = oldPlayer.soldTo;
          status = toStatus(oldPlayer.status);
          rating = clampRating(oldPlayer.rating);
        };
      }
    );
  };

  func createTeam(id : Nat, name : Text, ownerName : Text, teamIconPlayer : Text) : Team {
    {
      id;
      name;
      purseAmountTotal = 20500;
      purseAmountLeft = 20000;
      numberOfPlayers = 0;
      ownerName;
      teamIconPlayer;
      isTeamLocked = false;
      teamLogo = null;
    };
  };

  public func run(old : OldActor) : NewActor {
    let teams = Map.empty<Nat, Team>();

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
      let team = createTeam(id, name, owner, icon);
      teams.add(id, team);
    };

    {
      teams;
      players = convertPlayers(old.players);
      auctionState = {
        currentPlayerId = null;
        currentBid = 0;
        leadingTeamId = null;
        isActive = false;
      };
      nextPlayerId = 20;
    };
  };
};
