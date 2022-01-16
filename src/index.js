

// index.js
// ==================================================
import G6 from '@antv/g6';
import insertCss from 'insert-css';
// --------------------------------------------------

// data remote url
const groups = {
  'one': 'https://raw.githubusercontent.com/DRodrigo96/e21-antv-g6-app-sample/main/data/relations-one.json',
  'two': 'https://raw.githubusercontent.com/DRodrigo96/e21-antv-g6-app-sample/main/data/relations-two.json'
};

// => hov
const container = document.getElementById('container-tree');
const width = container.scrollWidth;
const height = container.scrollHeight || 500;
const colors = {
  B: '#5B8FF9',
  R: '#F46649',
  Y: '#EEBC20',
  G: '#5BD8A6',
  DI: '#A7A7A7',
};
const defaultTreeConfig = {
  width,
  height,
  modes: {
    default: ['zoom-canvas', 'drag-canvas'],
  },
  fitView: true,
  fitCenter: true,
  animate: true,
  defaultNode: {
    type: 'flow-rect',
  },
  defaultEdge: {
    type: 'cubic-horizontal',
    style: {
      stroke: '#CED4D9',
    },
  },
  layout: {
    type: 'indented',
    direction: 'LR',
    dropCap: false,
    indent: 300,
    getHeight: () => {
      return 60;
    },
  },
};
const defaultNetwConfig = {
  width,
  height,
  modes: {
    default: ['zoom-canvas', 'drag-canvas'],
  },
  layout: {
    type: 'force',
  },
  defaultNode: {
    size: 15,
  }
}
// => styles
// -> tooltip styles
insertCss(`
  .g6-component-tooltip {
    background-color: rgba(0,0,0, 0.65);
    padding: 10px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    width: fit-content;
    color: #fff;
    border-radius = 4px;
  }
`);

// -> tooltip items
const tooltip = new G6.Tooltip({
  offsetX: 20,
  offsetY: 30,
  itemTypes: ['node'],
  getContent: (e) => {
    const outDiv = document.createElement('div');
    const nodeName = e.item.getModel().name;
    let formatedNodeName = '';
    for (let i = 0; i < nodeName.length; i++) {
      formatedNodeName = `${formatedNodeName}${nodeName[i]}`;
      if (i !== 0 && i % 20 === 0) formatedNodeName = `${formatedNodeName}<br/>`;
    }
    outDiv.innerHTML = `${formatedNodeName}`;
    return outDiv;
  },
  shouldBegin: (e) => {
    if (e.target.get('name') === 'name-shape' || e.target.get('name') === 'mask-label-shape') return true;
    return false;
  },
});

// -> custom node
const registerFn = () => {
  G6.registerNode(
    'flow-rect',
    {
      shapeType: 'flow-rect',
      draw(cfg, group) {
        const {
          name = '',
          variableName,
          variableValue,
          variableUp,
          label,
          collapsed,
          currency,
          status,
          rate
        } = cfg;
        
        const rectConfig = {
          width: 202,
          height: 60,
          lineWidth: 1,
          fontSize: 12,
          fill: '#fff',
          radius: 4,
          stroke: '#CED4D9',
          opacity: 1,
        };

        const nodeOrigin = {
          x: -rectConfig.width / 2,
          y: -rectConfig.height / 2,
        };

        const textConfig = {
          textAlign: 'left',
          textBaseline: 'bottom',
        };

        const rect = group.addShape('rect', {
          attrs: {
            x: nodeOrigin.x,
            y: nodeOrigin.y,
            ...rectConfig,
          },
        });

        const rectBBox = rect.getBBox();

        // label title
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12 + nodeOrigin.x,
            y: 20 + nodeOrigin.y,
            text: name.length > 28 ? name.substr(0, 28) + '...' : name,
            fontSize: 12,
            opacity: 0.85,
            fill: '#000',
            cursor: 'pointer',
          },
          name: 'name-shape',
        });

        // price
        const price = group.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12 + nodeOrigin.x,
            y: rectBBox.maxY - 12,
            text: label,
            fontSize: 16,
            fill: '#000',
            opacity: 0.85,
          },
        });

        // label currency
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: price.getBBox().maxX + 5,
            y: rectBBox.maxY - 12,
            text: currency,
            fontSize: 12,
            fill: '#000',
            opacity: 0.75,
          },
        });

        // percentage
        const percentText = group.addShape('text', {
          attrs: {
            ...textConfig,
            x: rectBBox.maxX - 8,
            y: rectBBox.maxY - 12,
            text: `${((variableValue || 0) * 100).toFixed(2)}%`,
            fontSize: 12,
            textAlign: 'right',
            fill: colors[status],
          },
        });

        // percentage triangle
        const symbol = variableUp ? 'triangle' : 'triangle-down';
        const triangle = group.addShape('marker', {
          attrs: {
            ...textConfig,
            x: percentText.getBBox().minX - 10,
            y: rectBBox.maxY - 12 - 6,
            symbol,
            r: 6,
            fill: colors[status],
          },
        });

        // variable name
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: triangle.getBBox().minX - 4,
            y: rectBBox.maxY - 12,
            text: variableName,
            fontSize: 12,
            textAlign: 'right',
            fill: '#000',
            opacity: 0.45,
          },
        });

        // bottom line background
        const bottomBackRect = group.addShape('rect', {
          attrs: {
            x: nodeOrigin.x,
            y: rectBBox.maxY - 4,
            width: rectConfig.width,
            height: 4,
            radius: [0, 0, rectConfig.radius, rectConfig.radius],
            fill: '#E0DFE3',
          },
        });

        // bottom percent
        const bottomRect = group.addShape('rect', {
          attrs: {
            x: nodeOrigin.x,
            y: rectBBox.maxY - 4,
            width: rate * rectBBox.width,
            height: 4,
            radius: [0, 0, 0, rectConfig.radius],
            fill: colors[status],
          },
        });

        // collapse rect
        if (cfg.children && cfg.children.length) {
          group.addShape('rect', {
            attrs: {
              x: rectConfig.width / 2 - 8,
              y: -8,
              width: 16,
              height: 16,
              stroke: 'rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              fill: '#fff',
            },
            name: 'collapse-back',
            modelId: cfg.id,
          });

          // collpase text
          group.addShape('text', {
            attrs: {
              x: rectConfig.width / 2,
              y: -1,
              textAlign: 'center',
              textBaseline: 'middle',
              text: collapsed ? '+' : '-',
              fontSize: 16,
              cursor: 'pointer',
              fill: 'rgba(0, 0, 0, 0.25)',
            },
            name: 'collapse-text',
            modelId: cfg.id,
          });
        }

        this.drawLinkPoints(cfg, group);
        return rect;
      },
      update(cfg, item) {
        const { level, status, name } = cfg;
        const group = item.getContainer();
        let mask = group.find(ele => ele.get('name') === 'mask-shape');
        let maskLabel = group.find(ele => ele.get('name') === 'mask-label-shape');
        if (level === 0) {
          group.get('children').forEach(child => {
            if (child.get('name')?.includes('collapse')) return;
            child.hide();
          })
          if (!mask) {
            mask = group.addShape('rect', {
              attrs: {
                x: -101,
                y: -30,
                width: 202,
                height: 60,
                opacity: 0,
                fill: colors[status]
              },
              name: 'mask-shape',
            });
            maskLabel = group.addShape('text', {
              attrs: {
                fill: '#fff',
                fontSize: 20,
                x: 0,
                y: 10,
                text: name.length > 28 ? name.substr(0, 16) + '...' : name,
                textAlign: 'center',
                opacity: 0,
              },
              name: 'mask-label-shape',
            });
            const collapseRect = group.find(ele => ele.get('name') === 'collapse-back');
            const collapseText = group.find(ele => ele.get('name') === 'collapse-text');
            collapseRect?.toFront();
            collapseText?.toFront();
          } else {
            mask.show();
            maskLabel.show();
          }
          mask.animate({ opacity: 1 }, 200);
          maskLabel.animate({ opacity: 1 }, 200);
          return mask;
        } else {
          group.get('children').forEach(child => {
            if (child.get('name')?.includes('collapse')) return;
            child.show();
          })
          mask?.animate({ opacity: 0 }, {
            duration: 200,
            callback: () => mask.hide()
          });
          maskLabel?.animate({ opacity: 0 }, {
            duration: 200,
            callback: () => maskLabel.hide()
          });
        }
        this.updateLinkPoints(cfg, group);
      },
      setState(name, value, item) {
        if (name === 'collapse') {
          const group = item.getContainer();
          const collapseText = group.find((e) => e.get('name') === 'collapse-text');
          if (collapseText) {
            if (!value) {
              collapseText.attr({
                text: '-',
              });
            } else {
              collapseText.attr({
                text: '+',
              });
            }
          }
        }
      },
      getAnchorPoints() {
        return [
          [0, 0.5],
          [1, 0.5],
        ];
      },
    },
    'rect',
  );
};

// => plots
var tgraph;
var ngraph;

// -> tree plot
const treePlot = (data) => {
  if (!data) {
    return;
  }
  if (tgraph === undefined) {
    tgraph = new G6.TreeGraph({
      container: 'container-tree',
      ...defaultTreeConfig,
      plugins: [tooltip],
    });
    const handleCollapse = (e) => {
      const target = e.target;
      const id = target.get('modelId');
      const item = tgraph.findById(id);
      const nodeModel = item.getModel();
      nodeModel.collapsed = !nodeModel.collapsed;
      tgraph.layout();
      tgraph.setItemState(item, 'collapse', nodeModel.collapsed);
    };
    tgraph.on('collapse-text:click', (e) => {
      handleCollapse(e);
    });
    tgraph.on('collapse-back:click', (e) => {
      handleCollapse(e);
    });
    let currentLevel = 1;
    const briefZoomThreshold = Math.max(tgraph.getZoom(), 0.5);
    tgraph.on('viewportchange', e => {
      if (e.action !== 'zoom') return;
      const currentZoom = tgraph.getZoom();
      let toLevel = currentLevel;
      if (currentZoom < briefZoomThreshold) {
        toLevel = 0;
      } else {
        toLevel = 1;
      }
      if (toLevel !== currentLevel) {
        currentLevel = toLevel;
        tgraph.getNodes().forEach(node => {
          tgraph.updateItem(node, {
            level: toLevel
          })
        })
      }
    });
  };
  tgraph.read(data);
};

// -> network plot
const netwPlot = (data) => {
  if (!data) {
    return;
  }
  if (ngraph === undefined) {
    ngraph = new G6.Graph({
      container: 'container-netw',
      ...defaultNetwConfig
    });
    ngraph.data({
      nodes: data.nodes,
      edges: data.edges.map(function (edge, i) {
        edge.id = 'edge' + i;
        return Object.assign({}, edge);
      }),
    });
    ngraph.render();
    ngraph.on('node:dragstart', function (e) {
      ngraph.layout();
      refreshDragedNodePosition(e);
    });
    ngraph.on('node:drag', function (e) {
      const forceLayout = ngraph.get('layoutController').layoutMethods[0];
      forceLayout.execute();
      refreshDragedNodePosition(e);
    });
    ngraph.on('node:dragend', function (e) {
      e.item.get('model').fx = null;
      e.item.get('model').fy = null;
    });
  };
  ngraph.read(data);
};

// => async functions
const getVizPlots = async (group_id) => {
  // remote call
  const url = groups[group_id];
  const response = await fetch(url);
  const jsonData = await response.json();
  
  // data
  const treeData = jsonData.tree;
  const netData = jsonData.network;
  
  // plotting
  treePlot(treeData);
  netwPlot(netData);
};

// => execute initial functions
registerFn();

// => button listener
const buttonApi = document.getElementById("button-api");

buttonApi.addEventListener('click', (e) => {
  const uSele = document.getElementById("selection");
  const group_id = uSele.value;
  
  // > plots
  getVizPlots(group_id);
});

if (typeof window !== 'undefined')
  window.onresize = () => {
    if (!tgraph || tgraph.get('destroyed')) return;
    if (!container || !container.scrollWidth || !container.scrollHeight) return;
    tgraph.changeSize(container.scrollWidth, container.scrollHeight);
  };
if (typeof window !== 'undefined')
  window.onresize = () => {
    if (!ngraph || ngraph.get('destroyed')) return;
    if (!container || !container.scrollWidth || !container.scrollHeight) return;
    ngraph.changeSize(container.scrollWidth, container.scrollHeight);
};
function refreshDragedNodePosition(e) {
  const model = e.item.get('model');
  model.fx = e.x;
  model.fy = e.y;
};