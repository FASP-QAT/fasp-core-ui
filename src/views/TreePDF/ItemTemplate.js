import { highestContrast } from '../../../node_modules/basicprimitives/src/common/colors';
import { Colors } from '../../../node_modules/basicprimitives/src/enums';
import Size from '../../../node_modules/basicprimitives/src/graphics/structs/Size';

export default function ItemTemplate(options, itemTemplateConfig) {
  console.log("Options@@@", options)
  console.log("Options@@@", itemTemplateConfig)
  var _config = itemTemplateConfig;

  function template() {
    return {};
  }

  function getHashCode() {
    return 0;
  }

  function addCommas(cell1, row) {

    if (cell1 != null && cell1 != "") {
      cell1 += '';
      var x = cell1.replaceAll(",", "").split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1].slice(0, 2) : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
      // return cell1.toString().replaceAll(",", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    } else {
      return "";
    }
  }


  function render(doc, position, data) {
    var itemConfig = data.context,
      itemTitleColor = itemConfig.itemTitleColor != null ? itemConfig.itemTitleColor : Colors.RoyalBlue,
      color = highestContrast(itemTitleColor, options.itemTitleSecondFontColor, options.itemTitleFirstFontColor),
      contentSize = new Size(_config.itemSize);

    contentSize.width -= _config.itemBorderWidth * 2;
    contentSize.height -= _config.itemBorderWidth * 2;

    doc.save();

    /* item border */
    doc.roundedRect(position.x, position.y, 200, 100, 0)
      .lineWidth(_config.itemBorderWidth)
      .stroke('#dddddd');

    /* title background */
    doc.fillColor(itemConfig.payload.nodeType.id == 5
      || itemConfig.payload.nodeType.id == 4 ? "#002f6c" : "#a7c6ed")
      .roundedRect(position.x + 2, position.y + 2, 198, 18, 0)
      .fill();
    console.log("itemConfig@@@", itemConfig);
    /* title */
    doc.fillColor(itemConfig.payload.nodeType.id == 5
      || itemConfig.payload.nodeType.id == 4 ? "#FFF" : "#002f6c")
      .font('Helvetica-Bold', 12)
      .text((itemConfig.payload.label.label_en).replaceAll('-', ' '), position.x + 4, position.y + 7, {
        ellipsis: false,
        width: (contentSize.width - 4 - 4 * 2),
        height: 16,
        align: 'left',
      });

    // /* photo */
    // if (itemConfig.image != null) {
    //   doc.image(itemConfig.image, position.x + 3, position.y + 24);
    // }
    // /* photo frame */
    // doc.rect(position.x + 3, position.y + 24, 50, 60)
    //   .stroke('#cccccc');

    /* description */
    if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
      doc
        .font('Helvetica', 12)
        .fillColor('black')
        .text(addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue), position.x, position.y + 24, {
          ellipsis: false,
          width: (contentSize.width - 4),
          height: 74,
          align: 'center'
        });
    } else {
      var text = "";
      if (itemConfig.payload.nodeType.id == 4) {
        // if ((itemConfig.payload.nodeDataMap[scenarioId])[0].fuNode.usageType.id == 2) {

        text = addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue) + "% of parent, " + addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].fuPerMonth) + "/" + 'Month';
        // } else {
        //     return addCommas((itemConfig.payload.nodeDataMap[scenarioId])[0].displayDataValue) + "% of parent";
        // }

      } else if (itemConfig.payload.nodeType.id == 5) {
        text = addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].puNode.planningUnit.multiplier;
      } else {
        text = addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue) + "% of parent";
      }
      doc
        .font('Helvetica', 12)
        .fillColor('black')
        .text(text, position.x, position.y + 24, {
          ellipsis: false,
          width: (contentSize.width - 4),
          height: 74,
          align: 'center'
        });
    }

    if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {

    } else {
      doc
        .font('Helvetica-Oblique', 12)
        .fillColor('black')
        .text("= " + ((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayCalculatedDataValue != null ? addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayCalculatedDataValue) : ""), position.x, position.y + 45, {
          ellipsis: false,
          width: (contentSize.width - 4),
          height: 74,
          align: 'center'
        });

    }
    if (itemConfig.showModelingValidation) {
      var text = "";
      if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
        var childList = itemConfig.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
        console.log("Child List+++", childList);
        if (childList.length > 0) {
          var sum = 0;
          childList.map(c => {
            console.log("childList 1---", childList);
            console.log("child 1---", c.payload);
            sum += Number((c.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue)
          })
          text = sum.toFixed(2);
        } else {
          console.log("get payload 3");
          text = "";
        }
      } else {
        console.log("get payload 6");
        var childList = itemConfig.items.filter(c => c.parent == itemConfig.id && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
        console.log("Child List my+++", childList);
        if (childList.length > 0) {
          var sum = 0;
          childList.map(c => {
            console.log("childList 2---", childList);
            // console.log("child scenarioId 2---",(c.payload.nodeDataMap[scenarioId])[0] != null);
            console.log("child 2---", c.payload.label.label_en, "map---", c.payload);
            sum += Number(c.payload.nodeDataMap.hasOwnProperty(itemConfig.scenarioId) ? (c.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue : 0)
          })
          text = sum.toFixed(2);
        } else {
          console.log("get payload 7");
          text = "";
        }

      }
      var text1 = "";
      var text2 = "";
      if (text != "") {
        text1 = "Sum of children: ";
        text2 = " %"
      }
      var yPosition = position.y + 69;
      if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
        yPosition = position.y + 45;
      }
      doc
        .font('Helvetica', 12)
        .fillColor('black')
        .text(text1, position.x+30, yPosition, {
          width: (contentSize.width - 4),
          height: 74,
        })

        doc
        .font('Helvetica', 12)
        .fillColor(text != 100 ? 'red' : 'black')
        .text(text+text2, position.x+120, yPosition, {
          width: (contentSize.width - 4),
          height: 74,
        })

    }
    doc.restore();
  }

  return {
    template: template,
    getHashCode: getHashCode,
    render: render
  };
};