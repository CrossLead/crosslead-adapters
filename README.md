# crosslead-adapters

[![Build Status](https://travis-ci.org/CrossLead/crosslead-adapters.svg?branch=master)](https://travis-ci.org/CrossLead/crosslead-adapters)

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

## API

_(Coming soon)_


## Building this project

To compile the project, lint, and run tests run...

```shell
npm run test
```

To start `tsc` in watch mode, run...

```shell
npm run watch
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.
