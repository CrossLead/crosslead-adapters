# crosslead-adapters
Common data adapter functionality across web server and background workers


## Install

```bash
$ npm install --save crosslead-adapters
```


## Usage

#### Server Side

```javascript
import { adapterTypes, adapterFactory } from 'crosslead-adapters';

const googleCalendar = adapterFactory.createAdapter(adapterTypes.GOOGLE_CALENDAR);
...
```

#### Client Side

If using browserify / webpack / etc., simply require the client module
```javascript
import { adapterTypes } from 'crosslead-adapters/dist/client';
```
Additionally, there is a global exposing bower module...
```shell
bower install crosslead-adapters-client --save
```

## API

_(Coming soon)_


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [gulp](http://gulpjs.com/).
