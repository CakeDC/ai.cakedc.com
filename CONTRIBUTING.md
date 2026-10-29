Contributing
============

This repository follows the [CakeDC Plugin Standard](https://www.cakedc.com/plugin-standard). If you'd like to contribute fixes or improvements to the site, please read our [Contribution Guidelines](https://www.cakedc.com/contribution-guidelines) for detailed instructions.

Suggesting a resource for the catalog
-------------------------------------

The catalog is curated by the CakeDC team, so listing is a decision and not an automatic result of a pull request. To propose a plugin, MCP server, Claude skill or CLI tool, [open an issue](https://github.com/CakeDC/ai.cakedc.com/issues/new?template=suggest-a-resource.md) with:

* the repository URL and the Packagist or package name
* what it does, in a sentence or two
* the CakePHP and PHP versions it supports
* its license and latest release

We look for resources that are relevant to AI work in CakePHP, openly licensed, installable, and clear about their maturity. Early-stage resources can be listed, and are labelled as such.

Adding an entry (maintainers)
-----------------------------

1. Open `.vitepress/theme/components/home/hub-data.js`.
2. Add an object to `resources` with `type` (`plugin`, `mcp-server`, `skill` or `cli-tool`), `title`, `composer`, `details` and `github`. Set `link` to a docs page on this site, or `null` if there is none.
3. Write `details` from the resource's own README and `composer.json`. Do not overstate.
4. Set `isNew: true` while the entry is new.
5. Run `npm run docs:build`, check the home page, and add a line to `CHANGELOG.md`.

Local setup is in the [README](README.md).
