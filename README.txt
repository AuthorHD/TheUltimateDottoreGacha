# Il Dottore Ultimate Gacha 🧪

Open `index.html` locally to play.

## Gacha odds

In `script.js`, each item has a `weight`. Current default weights total 100:
- All eight character drops combined: 2% (0.25% each)
- Three ordinary items combined: 97.9% (about 32.6333% each)
- Golden Ruin Guard: 0.1%

The weights are relative values and total 100: all eight characters together have a 2% chance (0.25% each), the three ordinary items together have a 97.9% chance (about 32.6333% each), and Golden Ruin Guard has a 0.1% chance. The 60-pull character guarantee overrides the normal odds on the 60th consecutive pull without a character. Each 10-pull costs 10 pulls/tickets.

## Notes

- Collection and remaining pulls are saved in the visitor's browser using localStorage.
- Clearing browser data or changing device/browser may erase or not carry over progress.

CHARACTER GUARANTEE (60-PULL PITY)
- Every individual pull is counted, even though the button performs 10 pulls at once.
- If no character appears for 59 consecutive pulls, the 60th pull is guaranteed to be a character.
- Any character drop resets the counter to 0 immediately. Multiple characters in one ten-pull are possible.
- The current pity counter is saved in the browser together with the collection and ticket balance.
