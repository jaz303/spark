SRC = ace-editor app assets index.html node_modules

pkg:
	mkdir -p pkg

pkg/Spark.app: pkg
	cp -R res/node-webkit.app pkg/Spark.app
	mkdir pkg/Spark.app/Contents/Resources/app.nw
	cp -R $(SRC) pkg/Spark.app/Contents/Resources/app.nw
	cp support/osx/Info.plist pkg/Spark.app/Contents/Info.plist
	cat package.json | sed "s/\"toolbar\": true,/\"toolbar\": false,/" > pkg/Spark.app/Contents/Resources/app.nw/package.json

pkg/Spark.dmg: pkg/Spark.app
	rm -rf pkg/dmgroot
	mkdir pkg/dmgroot
	mv pkg/Spark.app pkg/dmgroot
	hdiutil create pkg/Spark.dmg -ov -volname "Spark" -fs HFS+ -format UDZO -srcfolder pkg/dmgroot
	
clean:
	rm -rf pkg