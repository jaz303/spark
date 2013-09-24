SRC = ace-editor app assets index.html node_modules

pkg:
	mkdir -p pkg

osx: pkg
	cp -R res/node-webkit.app pkg/Spark.app
	mkdir pkg/Spark.app/Contents/Resources/app.nw
	cp -R $(SRC) pkg/Spark.app/Contents/Resources/app.nw
	cat package.json | sed "s/\"toolbar\": true,/\"toolbar\": false,/" > pkg/Spark.app/Contents/Resources/app.nw/package.json

clean:
	rm -rf pkg