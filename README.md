### Installation

- `npm install` to install any dependencies
- `npm start` or `gulp watch` to start a live reload session

### Building

- `npm run build` or `gulp` to build the application

### Extras

- `gulp` or `gulp build` to build the application
- `gulp watch` to enable live reload
- `gulp clean` to delete the build folder
- `gulp styles` to run the style tasks
- `gulp scripts` to run the script tasks
- `gulp images` to run the image tasks
- `gulp favicon` to run the favicon tasks

## File Structure

```bash
├── app
│   ├── images
│   │
│   ├── js
│   │   ├── main.js
│   │   │
│   │   └── vendors
│   │
│   └── scss
│   │   ├── abstracts
│   │   │
│   │   ├── base
│   │   │
│   │   ├── pages
│   │   │
│   │   └── main.scss
│   │
│   └── fonts
│
└── build
    ├── images
    │
    ├── js
    │   ├── app.min.js
    │   │
    │   └── vendors.min.js
    │
    └── css
    │   └── styles.min.css
    │
    └── fonts
```
