module {
  type OldActor = {};
  type NewActor = {
    leagueSettingsJson : Text;
  };

  public func run(_old : OldActor) : NewActor {
    { leagueSettingsJson = "" };
  };
};
