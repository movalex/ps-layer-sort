#target photoshop
/*
<javascriptresource>
<name>[K] Layer Sorter</name>
<enableinfo>true</enableinfo>
<category>Kimber</category>
</javascriptresource>
*/

/**
 * @copyright Copyright (c) 2020 Matthew Kimber. All rights reserved.
 * @copyright Copyright (c) 2023 Alexey Bogomolov. All rights reserved.
 * @authors Matthew Kimber <matthew.kimber@gmail.com>, Alexey Bogomolov <mail@abogomolov.com>
 * @version 1.2
 * @license Apache Software License 2.0
 * Chengelog: 
 * 	- v.1.2: Add sort selected layers
 */

(function(app) {
	if (isDocumentOpen()) {
		main();
	} else {
		alert("Please open a document to run this script.");
	}
	/**
	 * @desc Program entry point. Retrieves the active document, 
	 * determines if layers exist, and then sorts all ArtLayer and LayerSet objects.
	 */

	var isGroup = false
	var currentGroup = null;

	function main() {
		var selectedLayers = getSelectedLayers();
		if (selectedLayers.length == 1) {
			alert("Select 2 or more Layers or a single Group of Layers to sort", "Warning")
			return
		}
		sortLayers(selectedLayers);
	}

	function addLayerSetContents(layerSet) {
		var targetArray = new Array();
		var refLength = layerSet.layers.length;
		for(var j = 0; j < refLength; j++) {
			var refLay = layerSet.layers[j];
			if (refLay.allLocked == true){
				targetArray.push(refLay)}
		}
		return targetArray
	}

	function getSelectedLayers() {
		try{
			//Version V2 works with folders aka layersets
			var layersCount = app.activeDocument.layers.length;
			if (layersCount == 0) {
				alert("No Layers in the Document", "Warning")
				return
			}
			var activeLayer = app.activeDocument.activeLayer;
			var selectedLayers = new Array();
			activeLayer.allLocked = true;

			if (activeLayer.typename == "LayerSet") {
				// get only layers inside current Group/LayerSet
				currentGroup = activeLayer;
				isGroup = true;
				selectedLayers = addLayerSetContents(activeLayer)
			} else {
				// get all selected layers
				for(var i = 0; i < layersCount; i++) {
					var layerType = app.activeDocument.layers[i].typename;
					var layerRef = app.activeDocument.layers[i];
					if (layerType == "LayerSet") {
						selectedLayers = addLayerSetContents(layerRef)
					}
					if (layerRef.allLocked == true) {
						selectedLayers.push(layerRef)}
				}
			}
			activeLayer.allLocked = false;
			return selectedLayers;
		}
		catch (e) {
			alert(e)}
	}

	function selectLayer(layerName, addToSelection) {   
		// selectLayer("layer 2");
		// selectLayer("layer 2", true);
		try {
			var r = new ActionReference();
			r.putName(stringIDToTypeID("layer"), layerName);
			var d = new ActionDescriptor();
			d.putReference(stringIDToTypeID("null"), r);
			if (addToSelection == true) d.putEnumerated(stringIDToTypeID("selectionModifier"), 
											stringIDToTypeID("selectionModifierType"),
											stringIDToTypeID("addToSelection"));
			executeAction(stringIDToTypeID("select"), d, DialogModes.NO);
		}
		catch (e) { alert(e); throw(e); }
	}
	
	function sortLayers(layers) {
		/**
		 * @desc Sorts the layers in the current LayerSet.
		 * @param {Layers} layers Collection of ArtLayer and LayerSet objects in the current scope.
		 */

		var activeDoc = app.activeDocument;
		var all_layers = activeDoc.layers

		
		var layerBuffer = new Array()
		for (var index = 0; index < layers.length; index++) {
			if (!layers[index].isBackgroundLayer) {
				layerBuffer.push(layers[index]);
			}
		}
		// Sort the buffer array using built-in natural sort comparer.
		layerBuffer.sort(compareWithNumbers);
		
		// Move each layer accordingly.
		for (var index = 0; index < layerBuffer.length; index++) {
			layerBuffer[index].move(all_layers[index], ElementPlacement.PLACEBEFORE);
		}
		
		// Group sorted layers.
		var GROUP_NAME = 'Sorted Layers';
		if (isGroup) {
			var targetGroup = currentGroup;
		} else {
			var targetGroup = activeDoc.layerSets.add();
			targetGroup.name = GROUP_NAME;
		}
		for (var index = layerBuffer.length - 1; index >= 0; index--) {
			if (layerBuffer[index].typename == "ArtLayer"){
				layerBuffer[index].move(targetGroup, ElementPlacement.INSIDE);
			}
		}
		
		// Select layers.
		for (var index = 0; index < layerBuffer.length; index++) {
			selectLayer(layerBuffer[index].name, true)
		}
	}
	
	/**
	 * @desc Checks to see if there is a document open.
	 * @returns {Boolean}
	 */
	function isDocumentOpen() {
		return app.documents.length > 0;	
	}
}(app));