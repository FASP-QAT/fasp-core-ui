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
    doc.roundedRect(position.x, position.y, 200, 85, 0)
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
        width: (contentSize.width - 30),
        height: 16,
        align: 'left',
      });

    // /* photo */
    // if (itemConfig.image != null) {

    var result = itemConfig.result;
    // if (itemConfig.payload.nodeDataMap[itemConfig.scenarioId][0].nodeDataModelingList.length > 0) {
    //   result = true;
    // } else {
    //   var arr = itemConfig.items1.filter(x => x.level == itemConfig.level && x.id != itemConfig.id && x.id < itemConfig.id);
    //   if (arr.length > 0) {
    //     for (var i = 0; i <= arr.length; i++) {
    //       if (arr[i] != null) {
    //         console.log("arr[i]---", arr[i])
    //         var nodeDataModelingList = arr[i].payload.nodeDataMap[itemConfig.scenarioId][0].nodeDataModelingList;
    //         if (nodeDataModelingList.length > 0) {
    //           var nodedata = nodeDataModelingList.filter(x => x.transferNodeDataId == itemConfig.id)[0];
    //           if (nodedata != null && nodedata != "") {
    //             result = true;
    //             break;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
    if (result) {
      if (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5) {
        // White image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABBElEQVRIie2UMU7DQBBFd5CCXCHRuU1BlyPQ0JEqVeQquUUooINruELcgipV2kSiSO2kMeIAUaT4UTAWm/Vi1sEV8q/smZ33ZiXLYgIDiDHmWV+nIkLobKjgie88tg1PgMISFMCkLfg1sKOaPXDzV3gfyD3wMh/A1anwC+CtBl5mDVw2hfeA1wB4mTlw3kSQOoCDB+rW0lD4nQd276k9eGqz3+Ajz2YvgHhgoj33VqM6QeYMLIBIe0fRWqRn7GR1gnf7IBBbvYpA67GzWF4nSPj67pfAwOl5BdobACudHds9+dFWlR9BRSRo9ixUcGo6QSf4Z4Kt9bxpexEDDPWfkwG3oXOfutc9YkJyMgwAAAAASUVORK5CYII=';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 160, position.y + 6, { fit: [10, 10] });
      } else {
        // blue image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABg0lEQVRIie2Uv0sDMRiGn1y1OgkiiKuTQ7F3ICqCOAlCl9LJP0ApaNNRN0UQ1NUf1LVQOgpCV8G16GILToII56BFBwdRsF4cqvTubGoUJ/Gbwvu93/skgQTMS2DLArYsAMJ0KGIcb2fWQUggzsCYxe3J8e8BbDkLYpvmzqcYGL3k9rT61ejXR7UXJ8E6ArpCnRewZqjstD1Je0BcDiIoA/0t+4p7LGuCs50LXYSlDR/P9iAoacMb2+tDvZYYXuj9HmAk3cmTOgBi2vAmZYhI5JDYWtQcUI/uI5j2KV4LV1NTTNFxlzMDOHIZmAtoSqx88glWQ8ocTnapPcDJJFFsBi2qSHU3pAFnexugikGr2sLJJPUAJXZDWpmHx3lAfQKAeu+VA3mNDA0Aun1rl7qX4ir/3CK8UVf5Z+peCnB9auC9hAFZoAZUUFaC89yNNvyjznM3KCuBEFWghkD628afFrYMXlNlz2hW/9B+qf4B/4A/Brj2rV2t68cAj/R7sIvy0qZjb7aSZoY+Y4WOAAAAAElFTkSuQmCC';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 160, position.y + 6, { fit: [10, 10] });
      }
    }
    if (itemConfig.payload.nodeType.id == 5) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB9ElEQVRIib2Vz4tOURyHnzMsDJq1hmE0JRJJaGIxZC3pLU0JRRGlyUIWo/wFavJjM8nSiiSjmSzYjBUzmEERG/JjI41ilo/Fe95c5733fe9taj711n3v+Xw/z/eee865gZJSA3Aw/r0fQrBsbdtgtaa+Uh+rT+J1LUIXFHxAnVIn1f2ZsT3qA/W1ekxdUjV8bezymTrQwjegPldn1O48T0dB7TpgFdADHMorjvdqwGZgC9BXBQAwDWwC5oBpdUTtjr8R4CNwDljWIqMlgBDCzxDC5QxoCvgADLULLgXIAV0HOsvUVAIsRIsPUHuBs8A2dVAt28SZWJsPUHvVUeAp8BI4ApwAZtuAJoB9wAtgUr2prv+vY3VU/aJeVFcmT7RbfaS+USf8p3G1P/GuUC/ErFtqH+qfeGNj0bOrHerVTPiVVlOnblA/q/Oo8+ol9at6Q12TBA/G7hu6rY6ps+rhLEhdrV6Lmaqi/o6DXQnoeBLc0HD0b1fvxXPoaBrcBMh00WX9WCjScOLfqr4vMjfNYwjhF3C3aH5z/DPUz6VcLcpGC1b7YCytChgD3lruy/QdOGljjbfXHQDUnXHpvYsrYm/yrr6p59Xlaqc6pH5qgKxvuqzG1V1NuAzoRxqc482C5qL/ocnuzlUEnc4LLgCdUnfkjf8FoF6aqhO9IcEAAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 6, { fit: [10, 10] });
    } else if (itemConfig.payload.nodeType.id == 4) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA/klEQVRIie2WoUpEQRhGzy+rbW2yyWAx+BZGg/gGCmvwKSyCzegTGCyGTYLN5KJdwSBWg4KgwZUbjmWE1b3e3R3vbXvaMP/3nYGBYVBv/R8D9VANSgjVofUT8FE2WMES0AbOgJ2I+Jn/dZq+ujhNu7qi3qX8tdqpEuRK2up5yj+qa1WCXElLPU75N3UDRu9gmBugN40k0QVWgQLYqxLUQdEaM3ACXGWWHwCdv+7gm25mOeq96lxuwaTMBDNBPYLPpgVHTQv2gdPGBBEhsAv0GxEARMQA2AIeGhEkyQuwCbzWKRj5CajrwAWwADwD75ndy8B86Y66rRZjnvJJuPwCIu9bEKiU654AAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 6, { fit: [10, 10] });
    } else if (itemConfig.payload.nodeType.id == 1) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAPUlEQVRIiWNgGAVUBfo5/xn0c/6TooWJVm4ZtWDUAuoBRhQeiWkcJ7g4BW4uzX1AGhjNyaMWDE8LRgFBAABoIQmIxvj6TwAAAABJRU5ErkJggg==';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 4, { fit: [12, 12] });
    }
    else if (itemConfig.payload.nodeType.id == 2) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA6UlEQVRIieWVQQ7BUBCGvym9gysg0QuQELdR7iJxHWGBWFlYkDiBnSN0LBSl7Xuvqhv+VZvvdf6ZN39S+A8F4YIg3GSz8ZJgvM37tG4t3h41QAbAJZvRz2SxPKtBTdq3BzkWYs4GeHGR6FCMuRqI3rtMFzExZwOkBYBqxjWYWHzi5S2YrEC7dlNrU2v2sx44TfCJVB9WxnOdcIjIPNmRE0vIMkG5BNkNSibIblAyQZDcQQUJgkpS9EwQmFL0hQSBcYLyCTIbSBQv0Usv0cScDSqfQLUJgO+nuzSxN+X/0URPIMpuei7Efk5XfVJjosEeOaIAAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 4, { fit: [12, 12] });
    }
    else if (itemConfig.payload.nodeType.id == 3) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB5ElEQVRIie2Tu2sUURSHvzM7IVFXYqMmnY1IEHdXZAn+A4LmUVlZBQTRbAaMIJhYJIWmCia4DytBsLEwIsQHpLCWLCE7m2IFwUowop3ERxzmWMxm2XF2MrfTIr9q7p1zznfPufcHe/rXko67OWcIZQZ0AKSB+LPUyq8icWcn9/HdO49bfBYHsDoX1xegeSANmkflJbnChUjs1u950CUyE3fMAb7OBh96C+1JA1PBUmZCcRlnBOEa8AvLf2oOED0BgKdl6vNb/NxfbgIHWjFnrvcj+hAQ0GlqlZo5AOsdAClxODmepvuH0yQ3do6A5z0CDgMruOWFuOIxHfi3AUVkDtv6huhdAHyC0WULk8A5kK/Y9higuwFSkZ3N6gf681WQ40AvsI7PFTZKrzntZFGeACmUS9Tur+1WPGjXVMfGeuhNrwKnUCrUSwWTtA53EKNDB+81izfo2r5pmmbWQWZiFOE5sI0lg6wXXVMzJgMyV48gdh04CtzALS2QLQyDLEePq0N/Q5JGJIj9uFl8Bbe0CLSZLsGMiYDWk+RL6EmamDERkBvPgcwBispl1hY/taUlmdEA4FsXgW6UB9SL4XmLH5gubEZtmbFNUaPt6PPqG/oGNzjQVeHjWy/0b7P6PtaMe/rv9AfrobFv0aGX2gAAAABJRU5ErkJggg==';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 4, { fit: [12, 12] });
    }
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
      var text = itemConfig.text;
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
        .text(text1, position.x + 30, yPosition, {
          width: (contentSize.width - 4),
          height: 74,
        })

      doc
        .font('Helvetica', 12)
        .fillColor(text != 100 ? 'red' : 'black')
        .text(text + text2, position.x + 120, yPosition, {
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