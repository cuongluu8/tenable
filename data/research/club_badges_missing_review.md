# Clubs the script couldn't confidently resolve

Nothing here was guessed -- each needs a human to look at it directly.

- **Universidad de Vinto** (entity_id 168, Bolivia): every candidate Wikipedia page found (Héctor Cuéllar, Wálter Flores, Gustavo Almada) has a football-club-shaped infobox but no image/logo field set at all.
- **Deportes La Serena** (entity_id 55, Chile): has a football club infobox but no image/logo field set; the town article (La Serena, Chile) has no club infobox either.
- **AD Tarma** (entity_id 149, Peru): no candidate page found with both a real club infobox AND an image field (Liga 3 (Peru) is a list page, not the club's own article).

9 more (Lincoln City, Salop United, Ancona, Compostela, St. Louis City, CSA,
Nacional Paraguay, Merida, San Lorenzo Paraguay) were resolved after this
file's first pass, each individually verified by hand -- see the
2026-09-06 session notes. Three of those first came back from the script
with a WRONG club entirely (CSA matched a Romanian club, Nacional
Paraguay and San Lorenzo Paraguay each matched a different, more famous
club sharing part of the name in another country, Merida matched a
Mexican club instead of the Spanish one) -- corrected by hand after
verifying each real page's own infobox directly. This is exactly the
"a valid image that's simply the wrong one" failure mode nothing can
catch automatically -- these 9 are now in the manifest/review page like
any other candidate, but are worth a slightly closer look than the rest
given how they got there.
