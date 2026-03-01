import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type TeamOld = {
    id : Nat;
    name : Text;
    purse_total : Nat;
    purse_remaining : Nat;
    players_bought : Nat;
    owner_name : Text;
    icon_player_name : Text;
    is_locked : Bool;
  };

  type PlayerOld = {
    id : Nat;
    name : Text;
    category : Text;
    base_price : Nat;
    image_url : Text;
    sold_price : ?Nat;
    sold_to : ?Nat;
    status : Text;
    rating : Nat;
  };

  type AuctionStateOld = {
    current_player_id : ?Nat;
    current_bid : Nat;
    leading_team_id : ?Nat;
    is_active : Bool;
  };

  type ActorOld = {
    teams : Map.Map<Nat, TeamOld>;
    players : Map.Map<Nat, PlayerOld>;
    auctionState : AuctionStateOld;
  };

  type TeamNew = {
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

  type PlayerNew = {
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

  type AuctionStateNew = {
    currentPlayerId : ?Nat;
    currentBid : Nat;
    leadingTeamId : ?Nat;
    isActive : Bool;
  };

  type ActorNew = {
    teams : Map.Map<Nat, TeamNew>;
    players : Map.Map<Nat, PlayerNew>;
    auctionState : AuctionStateNew;
  };

  public func run(old : ActorOld) : ActorNew {
    let newTeams = old.teams.map<Nat, TeamOld, TeamNew>(
      func(_id, oldTeam) {
        {
          id = oldTeam.id;
          name = oldTeam.name;
          purseAmountTotal = oldTeam.purse_total;
          purseAmountLeft = oldTeam.purse_remaining;
          numberOfPlayers = oldTeam.players_bought;
          ownerName = oldTeam.owner_name;
          teamIconPlayer = oldTeam.icon_player_name;
          isTeamLocked = oldTeam.is_locked;
          teamLogo = null;
        };
      }
    );

    let newPlayers = old.players.map<Nat, PlayerOld, PlayerNew>(
      func(_id, oldPlayer) {
        {
          id = oldPlayer.id;
          name = oldPlayer.name;
          category = oldPlayer.category;
          basePrice = oldPlayer.base_price;
          imageUrl = oldPlayer.image_url;
          soldPrice = oldPlayer.sold_price;
          soldTo = oldPlayer.sold_to;
          status = oldPlayer.status;
          rating = oldPlayer.rating;
        };
      }
    );

    {
      teams = newTeams;
      players = newPlayers;
      auctionState = {
        currentPlayerId = old.auctionState.current_player_id;
        currentBid = old.auctionState.current_bid;
        leadingTeamId = old.auctionState.leading_team_id;
        isActive = old.auctionState.is_active;
      };
    };
  };
};
