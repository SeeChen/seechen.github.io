
export function createElement(tag, props, children) {

    return {
        tag,
        props: props || {},
        children: children || []
    };
}

export function render(vNode) {

    if (typeof vNode === "string") {

        return document.createTextNode(vNode);
    }

    const el = document.createElement(vNode.tag);

    for (const [key, value] of Object.entries(vNode.props)) {

        el.setAttribute(key, value);
    }

    vNode.children.forEach(child => {

        el.appendChild(render(child));
    });

    return el;
}

export function vNodeDiff(oldNode, newNode) {

    const pathces = [];
    if (newNode === undefined || oldNode === undefined) {

        if (newNode !== undefined) {

            pathces.push({ type: "ADD", newNode });
        } else if (oldNode !== undefined) {

            pathces.push({ type: "REMOVE" });
        }

    } else if (typeof oldNode === "string" && typeof newNode === "string") {

        if (oldNode !== newNode) {

            pathces.push({ type: "TEXT", text: newNode });
        }
    } else if (oldNode.tag !== newNode.tag) {

        pathces.push({ type: "REPLACE", newNode });
    }

    else {

        const propPatches = [];
        for (const [key, value] of Object.entries(newNode.props)) {

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

            pathces.push({ type: "PROPS", props: propPatches });
        }

        const childPatches = [];
        const maxChildrenLength = Math.max(oldNode.children.length, newNode.children.length);
        for (let i = 0; i < maxChildrenLength; i++) {

            childPatches.push(vNodeDiff(oldNode.children[i], newNode.children[i]));
        }

        pathces.push({ type: "CHILDREN", children: childPatches });
    }

    return pathces;
}

export function patch(parent, patches, index = 0) {

    const el = parent.childNodes[index];

    patches.forEach(_patch => {

        switch (_patch.type) {

            case 'TEXT':

                el.textContent = _patch.text;
                break;
            case 'REPLACE':

                parent.replaceChild(render(_patch.newVNode), el);
                break;
            case 'REMOVE':

                parent.removeChild(el);
                break;
            case 'PROPS':

                _patch.props.forEach(({ key, value }) => {
                    if (value === undefined) {
                        el.removeAttribute(key);
                    } else {
                        el.setAttribute(key, value);
                    }
                });
                break;
            
            case 'ADD':

                parent.appendChild(render(_patch.newNode));
                break;

            case 'CHILDREN':

                _patch.children.forEach((childPatch, i) => {
                    patch(el, childPatch, i);
                });
                break;
        }
    });
}
