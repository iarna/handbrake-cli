handbrake-cli
-------------

Provides a way to find the handbrake cli in a crossplatform manner.

Currently this means installing it on OSes where binaries are trivially provided.

```
var pathToHandbrake = require('handbrake-cli').bin
```

If you require the module, it returns the path to the bundled binary, ready
for all your `child_process.execFile` needs.

You can run it right now via `npx`:

```
$ npx handbrake-cli -i example.avi -o example.mp4
```

Or from a global install:

```
$ npm i -g handbrake-cli
…
$ handbrake-cli …
```

FOR THE FUTURE
--------------

I would very much like this to prefer an existing on machine copy of
handbrake and elide having to install it itself.

Someday it might be nice to let it fall back to just compiling a copy itself.

SUPPORTED OSES
--------------

So, currently, this only supports Mac & Windows, via the downloads here:

https://handbrake.fr/downloads2.php

You'll notice that we didn't say Ubuntu, despite it being linked there.  The
Ubuntu binaries they provide are in deb form, so they have to be installed
globally (or at least, have a bunch of deps that have to be installed
globally) and that's very much against the intent of this module.

The code for handling Ubuntu is there, but we're currently skipping it.  If
someone were to put together static builds, those would be useable.
