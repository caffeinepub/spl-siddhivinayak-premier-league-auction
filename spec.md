# SPL – Siddhivinayak Premier League Auction

## Current State
- Squads page shows 10 team cards with 9 slots each (1 Owner, 1 Icon, 7 Auction)
- Owner and Icon slots show only a Crown/Star icon placeholder with no photo
- Team header shows "PTS REMAINING" purse balance
- No unsold players panel
- No hammer animation on sold/unsold events
- Settings > Teams tab has team logo upload but no owner photo or icon photo upload fields
- Backend Team type has ownerName and teamIconPlayer text fields but no photo URL fields

## Requested Changes (Diff)

### Add
- Backend: `ownerPhotoUrl` and `iconPhotoUrl` Text fields to Team type
- Backend: `updateTeamPhotos(teamId, ownerPhotoUrl, iconPhotoUrl)` function
- Settings > Teams: owner photo upload + icon photo upload fields (each with file picker and URL field), stored in localStorage (same approach as team logos)
- Squads page: Owner slot shows uploaded owner photo (circle crop)
- Squads page: Icon slot shows uploaded icon photo (circle crop)  
- Squads page: Unsold players panel — a separate collapsible list at the bottom of the page showing all players with status "upcoming" (not yet auctioned), allowing admin to see who still needs to be sold
- Squads page: Hammer animation overlay — when a player is sold (status changes from live→sold), show a brief hammer-strike animation with the team logo. When a player goes unsold (status reset to upcoming), show the same hammer animation WITHOUT a team logo
- Squads page: Store last known "just sold" player+team info to trigger the animation on status change detection

### Modify
- Squads page: Remove "PTS REMAINING" section from team header entirely
- Squads page: Owner slot — replace Crown icon placeholder with actual owner photo (uploaded via settings), fallback to Crown icon if no photo
- Squads page: Icon slot — replace Star icon placeholder with actual icon photo (uploaded via settings), fallback to Star icon if no photo

### Remove
- Squads page: Purse remaining display from team header card

## Implementation Plan
1. Add `ownerPhotoUrl` and `iconPhotoUrl` to backend Team type and seed data (empty strings)
2. Add `updateTeamPhotos` backend function
3. Store owner/icon photos in localStorage keyed by team ID (avoid base64 in backend to keep it light) — use keys `spl_owner_photos` and `spl_icon_photos`
4. Add helper functions in LandingPage.tsx for owner/icon photo storage
5. Settings > TeamRow: add owner photo upload row and icon photo upload row (same UX as team logo upload)
6. Squads > OwnerSlot: accept `photoUrl` prop, render photo if present
7. Squads > IconSlot: accept `photoUrl` prop, render photo if present
8. Squads > TeamSquadCard: remove purse remaining section from header
9. Squads > HammerAnimation: full-screen overlay with animated hammer SVG + optional team logo, triggered for 2.5s
10. Squads > Unsold Players Panel: collapsible section below squad showing all upcoming players with photo, name, category, base price
11. Wire animation trigger: compare previous player statuses to current on each poll cycle
