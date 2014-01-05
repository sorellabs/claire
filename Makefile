bin        = $(shell npm bin)
lsc        = $(bin)/lsc
browserify = $(bin)/browserify
groc       = $(bin)/groc
uglify     = $(bin)/uglifyjs
VERSION    = $(shell node -e 'console.log(require("./package.json").version)')


lib: src/*.ls
	$(lsc) -o lib -c src/*.ls

dist:
	mkdir -p dist

dist/claire.umd.js: compile dist
	$(browserify) lib/index.js --standalone claire > $@

dist/claire.umd.min.js: dist/claire.umd.js
	$(uglify) --mangle - < $^ > $@

# ----------------------------------------------------------------------
bundle: dist/claire.umd.js

minify: dist/claire.umd.min.js

compile: lib

documentation:
	cd docs/manual && make html

clean:
	rm -rf dist build lib

test:
	$(lsc) test/tap.ls

package: compile documentation bundle minify
	mkdir -p dist/claire-$(VERSION)
	cp -r docs/literate dist/claire-$(VERSION)/docs
	cp -r lib dist/claire-$(VERSION)
	cp dist/*.js dist/claire-$(VERSION)
	cp package.json dist/claire-$(VERSION)
	cp README.md dist/claire-$(VERSION)
	cp LICENCE dist/claire-$(VERSION)
	cd dist && tar -czf claire-$(VERSION).tar.gz claire-$(VERSION)

publish: clean
	npm install
	npm publish

bump:
	node tools/bump-version.js $$VERSION_BUMP

bump-feature:
	VERSION_BUMP=FEATURE $(MAKE) bump

bump-major:
	VERSION_BUMP=MAJOR $(MAKE) bump


.PHONY: test
