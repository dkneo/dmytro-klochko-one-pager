# Selecting the active work

## Current boundary

Use paintings, prints and posters only. Keep poems, quotations, people, generated website backgrounds and other records outside the living portrait.

## Selection

The hero shows one real work at a time. Choose it in this order:

1. a newly marked absolute favorite;
2. a recent keep that has not appeared this session;
3. an older absolute favorite;
4. a diverse fallback from a different artist than the previous work.

Constraints:

- never repeat the same work consecutively;
- avoid the same artist twice in a row;
- exclude duplicates and near-duplicates;
- exclude unavailable or low-resolution images;
- preserve the work's actual title, artist, year and source;
- generated brand backgrounds are not artworks and never enter the selector.

## Crop record

Store separate focal coordinates for desktop and mobile. Default to `object-fit: contain`. Use `cover` only when the subject remains identifiable and the crop has been reviewed at the actual viewport.

```json
{
  "id": "work-id",
  "desktop": { "fit": "cover", "x": 0.54, "y": 0.43 },
  "mobile": { "fit": "contain", "x": 0.5, "y": 0.5 }
}
```

Do not crop to match the brand palette. Do not recolor the artwork.
