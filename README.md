# jQuery-puzzle

This library implements a number puzzle game where players need to arrange numbered tiles in correct order by sliding them into an empty space.

## Installation

Import directly in html file.

``` html
<!-- HTML -->

<link href="path/jQuery-puzzle/puzzle.css" rel="stylesheet">
<script src="path/jQuery-puzzle/puzzle.js"></script>
```

## Usage

### Library settings

``` bash
# Edit default style
vi path/jQuery-puzzle/puzzle.css

# Edit default setting
vi path/jQuery-puzzle/puzzle.js
```

### How to use

``` html
<!-- HTML -->

<!-- Add data attribute "WKPUZZLE" to your game container -->
<div data-game="WKPUZZLE"></div>
```

``` javascript
<!-- JavaScript -->

// Initialize the puzzle game
$('[data-game="WKPUZZLE"]').WKPuzzle();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
