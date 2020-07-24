pcli
====

Points CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/pcli.svg)](https://npmjs.org/package/pcli)
[![Downloads/week](https://img.shields.io/npm/dw/pcli.svg)](https://npmjs.org/package/pcli)
[![License](https://img.shields.io/npm/l/pcli.svg)](https://github.com/joe307bad/pcli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g pcli
$ pcli COMMAND
running command...
$ pcli (-v|--version|version)
pcli/0.0.2 darwin-x64 node-v14.2.0
$ pcli --help [COMMAND]
USAGE
  $ pcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`pcli achievements:analyzer`](#pcli-achievementsanalyzer)
* [`pcli achievements:changeset`](#pcli-achievementschangeset)
* [`pcli help [COMMAND]`](#pcli-help-command)

## `pcli achievements:analyzer`

Set of tools to analyze Achievements

```
USAGE
  $ pcli achievements:analyzer

OPTIONS
  -f, --file=file  Achievements JSON file
  -h, --help       show CLI help

EXAMPLE
  $ pcli achievements:analyzer
```

_See code: [src/commands/achievements/analyzer.ts](https://github.com/joe307bad/pcli/blob/v0.0.2/src/commands/achievements/analyzer.ts)_

## `pcli achievements:changeset`

Perform actions on a Changesets for an Achievement List

```
USAGE
  $ pcli achievements:changeset

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ pcli achievements:changeset
```

_See code: [src/commands/achievements/changeset.ts](https://github.com/joe307bad/pcli/blob/v0.0.2/src/commands/achievements/changeset.ts)_

## `pcli help [COMMAND]`

display help for pcli

```
USAGE
  $ pcli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
