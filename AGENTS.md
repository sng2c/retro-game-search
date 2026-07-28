# AGENTS.md - Retro Game Search (Core)

## Project Overview
A static site generator that creates a searchable database of retro games. It processes CSV data to generate a fast, client-side searchable HTML index.

## Project Structure
```text
retro-game-search/
├── build.py        # Main generator script (CSV -> HTML)
├── games.csv       # Database of games (title, model, etc.)
├── models.csv      # Database of console models and their labels
├── template.html   # HTML template with <!-- @@GAMES_DATA@@ --> marker
├── index.html      # Generated output file
└── sc.png          # Static asset
```

## Build & Test Commands
- **Build Site**: `python3 build.py`
- **Verification**: Check that `index.html` is generated and contains the `GAMES` and `MODELS` constants.

## Conventions & Patterns
- **Korean Search**: Implements a custom `decompose` and `chosung_only` logic to allow searching by Jamo and Chosung (initials), improving user experience for Korean users.
- **Data Flow**: `models.csv` $\rightarrow$ `games.csv` $\rightarrow$ `template.html` $\rightarrow$ `index.html`.
- **Consistency**: The build script performs a consistency check to ensure every model used in `games.csv` exists in `models.csv`.

## Boundaries & Constraints
- **Static Only**: This is a pure static site generator. Do not add server-side logic.
- **Marker Dependency**: `template.html` must contain the `<!-- @@GAMES_DATA@@ -->` marker for the generator to work.
