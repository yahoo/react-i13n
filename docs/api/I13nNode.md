## I13nNode
The `I13nNode` class used to create an `I13nTree`, you will need this if you are implementing a plugin, we provide APIs for you to build the functionalities you want with the plugin.

### Constructor(parentNode, model, isLeafNode, isViewportEnabled)
 * `parentNode` - parent node
 * `model` - custom model values
 * `isLeafNode` - indicate if it's a link node
 * `isViewportEnabled` - indicate if viewport check enable

### appendChildNode(I13nNode)
Append an i13n node.

### getChildrenNodes()
Get the children nodes array.

### getCustomAttribute(key)
Get the custom value.

### getDOMNode()
Get the DOMNode set by `setDOMNode`.

### getMergedModel()
Get the model data which is traversed and combined to the root.

### getModel()
Get the i13nModel data of this i13n node.

### getPosition()
Get the position of its parent.

### getText(target)
Get the inner text value of DOMNode related to this i13n node set by `setDOMNode`. You can pass a DOMObject, getText will try to get target's text first then fallback to the related DOMObject, it's used for some case like click event, you want to get the text of real click target, instead of the DOMObject that we hook the click event.

### isInViewport()
Get if the i13nNode is in the viewport, if you don'y enable the viewport checking, it will always return true.

### isLeafNode()
Get the flag indicates if the node is a leaf node.

### isOrderDirty()
If the children nodes are already sorted, we will mark this flag as false, which means next time when we try to execute the action related to the order, e.g., `getPosition()`, we don't need to sort them again. This flag will be set as true if it has any child appended or removed.

### removeChildNode(I13nNode)
Remove the i13n node.

### setCustomAttribute(key, value)
Set the custom attribute you want, it used for some cases if you want to record some status, e.g., already traversed and you don't want to do the action again.

### setDOMNode(DOMObject)
Set the DOMObject related to this I13Node.

### sortChildrenNode()
Sort the children nodes, this will automatically executed when you try to `getPosition`, which means for most case you will not need to do this manaully.

### traverseNodes(handler)
Will traverse the all the children under this node and execute the handler function passing with the child node.
