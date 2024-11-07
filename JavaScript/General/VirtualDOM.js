export function vNodeCreate(tag, props, children) {

    return {
        tag,
        props: props || {},
        children: children || []
    };
}

export function vNodeRender(vNode) {

    if (typeof vNode === "string") {
        return document.createTextNode(vNode);
    }

    const el = document.createElement(vNode.tag);
    for (const [ key, value ] of Object.entries(vNode.props)) {
        el.setAttribute(key, value);
    }

    vNode.children.forEach(child => {
        el.appendChild(vNodeRender(child));
    });

    return el;
}

export function vNodeDiff(oldNode, newNode) {

    const patches = [];
    if (oldNode === undefined || newNode === undefined) {

        if (newNode !== undefined) {
            patches.push({ type: "ADD", newNode });
        } else if (oldNode !== undefined) {
            patches.push({ type: "REMOVE" });
        }
    }

    else if (typeof oldNode === "string" && typeof newNode === "string") {

        if (oldNode !== newNode) {
            patches.push({ type: "TEXT", text: newNode });
        }
    }
    
    else if (oldNode.tag !== newNode.tag) {
        patches.push({ type: "REPLACE", newNode });
    }

    else {
        const propPatches = [];
        for (const [ key, value ] of Object.entries(newNode.props)) {
            if (oldNode.props[key] !== value) {
                propPatches.push({ key, value });
            }
        }

        for (const key in oldNode.props) {
            if (!(key in newNode.props)) {
                propPatches.push({ key });
            }
        }

        if (propPatches.length > 0) {
            patches.push({ type: "PROPS", props: propPatches })
        }

        const childPatch = []
        const maxChildrenLength = Math.max(oldNode.children.length, newNode.children.length);
        for (let i = 0; i < maxChildrenLength; i++) {
            childPatch.push(vNodeDiff(oldNode.children[i], newNode.children[i]));
        }
        patches.push({ type: "CHILDREN", children: childPatch });
    }

    return patches;
}

export function vNodePatch(parent, patches, index = 0) {

    const el = parent.children[index];

    patches.forEach(patch => {
        switch(patch.type) {
            case "ADD":
                parent.appendChild(vNodeRender(patch.newNode));
                break;
            case "REMOVE":
                parent.removeChild(el);
                break;
            case "TEXT":
                el.textContent = patch.text;
                break;
            case "REPLACE":
                parent.replaceChild(vNodeRender(patch.newNode), el);
                break;
            case "PROPS":
                patch.props.forEach(({ key, value }) => {
                    if (value === undefined){
                        el.removeAttribute(key);
                    } else {
                        el.setAttribute(key, value);
                    }
                });
                break;
            case "CHILDREN":
                patch.children.forEach((childPatch, i) => {
                    vNodePatch(el, childPatch, i);
                });
                break;
        }
    });
}
