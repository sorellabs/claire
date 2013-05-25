bin := $(shell npm bin)
browserify := $(bin)/browserify lib/index.js
lsc := $(bin)/lsc

lib: src/*.ls
	$(lsc) -o lib -c src/*.ls

build/test: test/*.ls
	$(lsc) -o build/test -c test/*.ls

build/test/specs: build/test test/specs/*.ls
	$(lsc) -o build/test/specs -c test/specs/*.ls

build/lib: src/*.ls
	$(lsc) -o build/lib -c src/*.ls

bundle: lib
	mkdir -p dist
	$(browserify) --standalone claire > dist/claire.umd.js

clean:
	rm -rf dist build lib

pretest: build/lib build/test build/test/specs

prepublish: lib

test: pretest
	node ./build/test/node.js

.PHONY: test
