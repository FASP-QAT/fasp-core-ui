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
        var image = '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';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 160, position.y + 6, { fit: [12, 12] });
      } else {
        // blue image
        var image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAf9JREFUeNq01T1rVEEUBuBnbgJRQRuJH/GryA8wYKG/IFjYiCAWsRRR0ELsrbULgqCCghYiWFoE1FZECzHYBAu1UcEYolGiyeYei727e3e9u1kTcmCYuXPPzHtmznveSRFhI22wMUhjF8rzo7iCp7iP9igGsnqfBytBpHorLN5O/gtQsl24ihMYxxwer/UEWcf3DkwWm8NO3MLRirXbcAynsa8fgFHcwckOn914iOMYal5NHiO4LrmHw1Joti4A49iDJ5gp5r7jOaZxCsMl/8BiPSdRMxCarSrJkik8wm9MCDcwLTmLz9heALZyHkjIrKzKIryvLwr4QSL8Eb7KzGNeKZpi++gkWC+AxuawpfR/qBlpa/PGILWdqGeS2wsu2vqwWqB907TKWiCt6Kt91gjQy1LfUlG9MK1bi7K+rmcDAdaN188Jou22YpUcxFpP0NCYFp1TJdPy9D9J7hJnBNICakUxL9RFMPXNovZCaynkARzCNxF7JVvrXukI8kLCZ/GyN0CyWRbkNomUlaEK8RuT1OrvR4LLWJQM4Hx1DlJTGcnTJ78GP1jKZuSW1FID4GPxlM5ipBTgMPbjGp51k+tWH2nKcvZG5AuymCsxI/ACE7iLg8X8Mi7iZiePurHop+Sd5AuVWv8aZ0oP0yXcriqUwXUU6SucKxL/oEsg/g4AwuGc7DwaBpkAAAAASUVORK5CYII=';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 160, position.y + 6, { fit: [12, 12] });
      }
    }
    if (itemConfig.payload.hasOwnProperty('extrapolation') && itemConfig.payload.extrapolation.toString() == "true") {
      if (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5) {
        var image = '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';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 160, position.y + 4, { fit: [15, 15] });
      } else {
        var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkMzMUFDNzY5RUQwMTFFQzhBRERFQjFCNkJGN0U4QUYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkMzMUFDNzU5RUQwMTFFQzhBRERFQjFCNkJGN0U4QUYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmRpZDo2MDZFQTMzRUNDOUVFQzExQTIzOEEwRDA3RDM3NTEyQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MDZFQTMzRUNDOUVFQzExQTIzOEEwRDA3RDM3NTEyQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrDSWakAAAKRSURBVHjaYvz//z8DLQETA43BqAUDbwELMofNpOByTYJtIJB5B1n8y/cfDHcfvmAojnNEFmY+fvwYOyvj/z///v1n4OEX+MclJP0nyt8ZtwXAJCv24t0XFDFZMV44+8XbL8hSojN3Plv16fN3MSCbUVCQ52ltsrQPkP0NXxD9ZmNh/g/EDDCMDDbsu8TAxMjIIMDLxcDNxfEi0Fl/xcsXX9Vfvv2pdv/FF51jFx8yE4yD/0hYRpwXX/CqrNp5KRPoCkhQMDP95WRn/U/QApALYRgJeACxCRJfKalh7bYH91/rsHOxfTDQEG1iY2F88+//f1aCFvz++xeMFaX4YEKevQuPbt56/OFmIFsNiKUSG9dte/b4vSobH+eXYDvlcKBYfZiDamCok9Y3vKkIBH7++oPMda2Zsmc1MJGw/Pz+R2LziQc7dp998vPFk3fqLLzsP2I9NMO///i9C6r2DsFkCgPqcsIgyrFq0u7V//7+5+YX4nr049df7g9vvykCkxoDCxf7zzR//Yifv/9sIy2jAZ0qLsjzE8iyKZ2wa93vn3/4OblZH4Q7qdr35rv5s7AyfWdkYfpXFGUWDVSzEaRl+8n7DA9ffWZYtf8mg1fRMvw+AMYrMCUw8sxYf2bKr4/fBfgk+B46GUp5AaUegPCkMu/g56/fc//89Xft8j3XSM/JwDTG/O3nv7dlMdYJk5cd75GX4skChvktVmYmhqW7rjP8+ftvOxMTIwMzExMDKwsT6RawsDCzbTt2y+TPn7/XRUW5i87dfvUPKKxNQtHzF4hv4LTgz9+/7y/ffT39719gZPxn+MvMwsTMCAy3n7//wgKRAZiCgcn4P8MPuBhSEDMwfABSuihio1Xm8LcAIMAAGkgAidc+hToAAAAASUVORK5CYII=';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 160, position.y + 4, { fit: [15, 15] });
      }
    }
    if (itemConfig.payload.nodeType.id == 5) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB9ElEQVRIib2Vz4tOURyHnzMsDJq1hmE0JRJJaGIxZC3pLU0JRRGlyUIWo/wFavJjM8nSiiSjmSzYjBUzmEERG/JjI41ilo/Fe95c5733fe9taj711n3v+Xw/z/eee865gZJSA3Aw/r0fQrBsbdtgtaa+Uh+rT+J1LUIXFHxAnVIn1f2ZsT3qA/W1ekxdUjV8bezymTrQwjegPldn1O48T0dB7TpgFdADHMorjvdqwGZgC9BXBQAwDWwC5oBpdUTtjr8R4CNwDljWIqMlgBDCzxDC5QxoCvgADLULLgXIAV0HOsvUVAIsRIsPUHuBs8A2dVAt28SZWJsPUHvVUeAp8BI4ApwAZtuAJoB9wAtgUr2prv+vY3VU/aJeVFcmT7RbfaS+USf8p3G1P/GuUC/ErFtqH+qfeGNj0bOrHerVTPiVVlOnblA/q/Oo8+ol9at6Q12TBA/G7hu6rY6ps+rhLEhdrV6Lmaqi/o6DXQnoeBLc0HD0b1fvxXPoaBrcBMh00WX9WCjScOLfqr4vMjfNYwjhF3C3aH5z/DPUz6VcLcpGC1b7YCytChgD3lruy/QdOGljjbfXHQDUnXHpvYsrYm/yrr6p59Xlaqc6pH5qgKxvuqzG1V1NuAzoRxqc482C5qL/ocnuzlUEnc4LLgCdUnfkjf8FoF6aqhO9IcEAAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 6, { fit: [10, 10] });
    } else if (itemConfig.payload.nodeType.id == 4) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA/klEQVRIie2WoUpEQRhGzy+rbW2yyWAx+BZGg/gGCmvwKSyCzegTGCyGTYLN5KJdwSBWg4KgwZUbjmWE1b3e3R3vbXvaMP/3nYGBYVBv/R8D9VANSgjVofUT8FE2WMES0AbOgJ2I+Jn/dZq+ujhNu7qi3qX8tdqpEuRK2up5yj+qa1WCXElLPU75N3UDRu9gmBugN40k0QVWgQLYqxLUQdEaM3ACXGWWHwCdv+7gm25mOeq96lxuwaTMBDNBPYLPpgVHTQv2gdPGBBEhsAv0GxEARMQA2AIeGhEkyQuwCbzWKRj5CajrwAWwADwD75ndy8B86Y66rRZjnvJJuPwCIu9bEKiU654AAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 6, { fit: [10, 10] });
    } else if (itemConfig.payload.nodeType.id == 1) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABQElEQVRIie2Vv0vDQBTHPxdPlEAnB+skTg5CshV/gDgXESw4OLqJJnRzLv4BUiEuBZ0cKk4ObgV1EKVQiIXujgpWdCklFc6hi5DEpGkchH7Hd/D5cNx772CUiAhfxbRUYtqT4+NpiWExI0NPhJzDLT8PKwi6QQsA9fWIaefSF3T1JeAamAZ1h2FvDyMY81Xa9x6rsxe0M1PAMoICMznBS/02icDfRT9jWEUER4AG6gzZ26VR6aUnADD3N0GcAzqKGprcwi1/pCcA+o+troAs0ELI9bgd9udzEC0w7QKoGyCLoob0VgaZj98FhlUEdQnowCnjXp5G5TMuHMLeYK0keX87RrAHKASHuE5pEHC4YP4gw0SniiAPdFFqh+ZJNQkcgnbRZOcBWABeQWzQdOpJ4cGCPhyEXExj2f3//2CUyHwD8XNSsbY/3j8AAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 5, { fit: [12, 12] });
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