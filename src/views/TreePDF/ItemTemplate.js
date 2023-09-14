import { highestContrast } from '../../../node_modules/basicprimitives/src/common/colors';
import { Colors } from '../../../node_modules/basicprimitives/src/enums';
import Size from '../../../node_modules/basicprimitives/src/graphics/structs/Size';
export default function ItemTemplate(options, itemTemplateConfig) {
  var _config = itemTemplateConfig;
  function template() {
    return {};
  }
  function getHashCode() {
    return 0;
  }
  function addCommas(cell1, row) {
    if (cell1 != null && cell1 != "") {
      cell1 = Number(cell1).toFixed(2);
      cell1 += '';
      var x = cell1.replaceAll(",", "").split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1].slice(0, 2) : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
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
    doc.roundedRect(position.x, position.y, 200, 110, 0)
      .lineWidth((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].isPUMappingCorrect==0?2:_config.itemBorderWidth)
      .stroke((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].isPUMappingCorrect==0?'#BA0C2F':'#dddddd');
    /* title background */
    doc.fillColor(itemConfig.payload.nodeType.id == 5
      || itemConfig.payload.nodeType.id == 4 ? "#002f6c" : "#a7c6ed")
      .roundedRect(position.x + 2, position.y + 2, 198, ((itemConfig.payload.label.label_en).length <= 20 ? 18 : 32), 0)
      .fill();
    /* title */
    doc.fillColor(itemConfig.payload.nodeType.id == 5
      || itemConfig.payload.nodeType.id == 4 ? "#FFF" : "#002f6c")
      .font('Helvetica-Bold', 12)
      .text((itemConfig.payload.label.label_en).replaceAll('-', ' '), position.x + 4, position.y + 7, {
        // ellipsis: false,
        width: (contentSize.width - 70),
        // height: 16,
        align: 'left',
      });
    // /* photo */
    // if (itemConfig.image != null) {
    var result = itemConfig.result;
    var result1 = itemConfig.result1;
    var result2 = itemConfig.result2;
    if (result2) {
      if (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5) {
        // White image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0Q4MjVFOUREMEZDMTFFQ0FBRThCRDFDNUI4N0FFRTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0Q4MjVFOUVEMEZDMTFFQ0FBRThCRDFDNUI4N0FFRTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDRDgyNUU5QkQwRkMxMUVDQUFFOEJEMUM1Qjg3QUVFMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDRDgyNUU5Q0QwRkMxMUVDQUFFOEJEMUM1Qjg3QUVFMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsdnMaoAAAHTSURBVHja7Ja7SgNBFIaTaMx6QdJ7IYhiKxYWFgYvL6BoIz6BgkUQEYUUYhHsbKJiQJu8hEUqTQwqXsCAl0bBiIjGu1jo+g+cgcO6m8TdUZsc+NhlZna+zGTO2XXruu76j3CXxH8VniLGDIAEyIJ9EAKaY7NYcR7GwJv+PWKgssCzeSlWegkWwA6TLwKfanE/eCXBBeih9maQZPJloKkUb9LE56DX0NdkkIdVim9o0nmL/gawTWOOQM1PxVan+pquQdDC2ltBGNSDFLVVAb+qUz3OtjIFAtQeoTaxI1m637Nzwq06xERRJk+DRtDJhCJewDB7rhaUOU0njVJGxiFYAles7RkMgT6wDjJgC4SA167YRQ8L2aehgLyzHH8Cj4b+D/rRXrtiQQWYphWfgV0wAgbBA5PdgTitmhcZza5YUg3q2Cq6QI5JxIHrpoOYZu1Rs8Nnt9Z6QIKt9J7uV6g/QNkgY0KV2A9OadI1EKSVdbAxvLyeqBJ76b/W6SpSzW0ybobG5FSJBZNsK5OsyEjawQH1Z1SKffR2krHB5G1MqtMrVplYymOGCjdrSKmIWT47Fcs0W9XNYw6UO83jQuV1ChyDW9rmUSupoPRdXRL/WnwJMABt/Fg7W6QwIQAAAABJRU5ErkJggg==';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 145, position.y + 4, { fit: [14, 14] });
      } else {
        // blue image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUIwRkRDMDFEMEZDMTFFQ0I4REVFRDExRTA1Qjc5MDAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUIwRkRDMDJEMEZDMTFFQ0I4REVFRDExRTA1Qjc5MDAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5QjBGREJGRkQwRkMxMUVDQjhERUVEMTFFMDVCNzkwMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5QjBGREMwMEQwRkMxMUVDQjhERUVEMTFFMDVCNzkwMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrXPzccAAAJGSURBVHja7JZbiE5RFMd938zHmHg0SSQvg0SjRJIQah5MbqVIePFmxANKPLjMw5ChKMkDjVzKEw8uEV7I1EyZkts8iNK4TAkhY/j8Vv33tJy+yzjnZF5m1a+z9z57f/+99tprfSeTz+eHDYZlhoQHRThT1+jfjYf9sACq4CkchptxhPKPjv/VrywybxJcgylubBwshM1wJqnH2QGIvocnalfAKVidtvBEuOFE22A21EE4qxych3VpCh+AWie6DF7BT9gKx/RuBLRCQ1rCi/V8AyuhJ/J+uxO3Y2/WJhIL5/T8DN0F5o+S+G31axWexMKP9ZzqYhq8OwnPJfzNp2Qc4coCMZ6v8S3QJyHL440wElrc/JfwOg2P78ImXSazbXAUvsJu+O3m2qZ2wnf1a2Bskjy2VFkLvU78HiyJHKu1J8A8uKMwPIP7UJ+kZJr4OcW3lPUVCJmNbYCLxUpmtsQP2qJV0Ak/hNXrNTqF3sg9sbxvd2NnS1W4bBlvrsIsmA4zYCZchgfyqt8huAJzXJ4P1+bXxxEOx9YFL+S1rTkC1ZF4H4QxkSKTk+dL4whHrUaemz2EPfAJbsEXV+FOuBqwLw3hCrfOjrhJBachUljspnaoPTkN4Xe6ZGZzlefdLveDVYmwwcTCFvO98CtSZLyFizVN/c40hM2uK099kTmk9mi4BCvU/wi7ytXqf7ELus2tcmAHLJJwiOkH/b22pykcymu1PocyyvlgPbpwbXHzuJydhuUqKib2Vp9P9cVEhz7o/6v9EWAA+XaWIZHSYcsAAAAASUVORK5CYII=';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 145, position.y + 4, { fit: [14, 14] });
      }
    }
    if (result1) {
      var position123 = (result2 == true) ? 130 : 145;
      if (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5) {
        // White image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODc0N0Y1OTNEMEZGMTFFQzgxNTVBN0UyRDJDNEY0OEUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODc0N0Y1OTREMEZGMTFFQzgxNTVBN0UyRDJDNEY0OEUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4NzQ3RjU5MUQwRkYxMUVDODE1NUE3RTJEMkM0RjQ4RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4NzQ3RjU5MkQwRkYxMUVDODE1NUE3RTJEMkM0RjQ4RSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqtwKZsAAADGSURBVHjaYvz//z/DQAAmhgECoxYPeoslgfgIEH8D4lNArEQvizmglnMCsQSUpovFoDz4F8r+C+WPJq5Ri0ctHrV4cFvMSIBPM4s/oxWZn0k1gIVE9dZQx4oBMRdUDETbAvFDKP8IcaU9sM1FAl4DxB+B+AMQ//0PAX+hYiC8lVizSLVYGYjP/McOrgOxNq0sBmF1IL6KZukDIDYgxRxyLAZhXSC+BbX0KRDbkGoGuRaDsDUQHwNif3L0M4426EctphUACDAAi7jsMNZkUE0AAAAASUVORK5CYII=';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + position123, position.y + 3, { fit: [15, 15] });
      } else {
        // blue image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QThENjEzRTNEMEZGMTFFQ0I0NkREMzQ5QjUyNThFMjgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QThENjEzRTREMEZGMTFFQ0I0NkREMzQ5QjUyNThFMjgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBOEQ2MTNFMUQwRkYxMUVDQjQ2REQzNDlCNTI1OEUyOCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBOEQ2MTNFMkQwRkYxMUVDQjQ2REQzNDlCNTI1OEUyOCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjksJ9cAAAEtSURBVHjaYvz//z/DQAAmhgECoxYPf4tZSFHMbpIHY4r/+ft/zb//DMZMjAyXWJgZw4FiD0ESP89Mor7FjAiaHUhJADEnEk2XoP4HxH+h7L9Q/mjiGrV41OJRiwehxb///mfA1V4BiQPLb9pYDCoXf/8BWcL4BVhgIxeZX/78+U9SuUlqJWENbKMx/f73XwTYVOMG+/Q/A9eff//tgX59DK1EjlDfYkbGgv+M/93+/QOHLC80iCX//2OYAXEY4yFiLSYpqNmYGSuA9e9NIJMfSS+I5gP69ikrM2M5TeKYkZHhLhsLYyyQvoIm/oCVhTESSF+jWXYCBudNNmamKKAPb0OFngEtjQZGw0Wa5uP/YB/+v8zCwpQADPZjQDqT8T/DMZI9MNqTGPYWAwQYANbRVf1r4c18AAAAAElFTkSuQmCC';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + position123, position.y + 3, { fit: [15, 15] });
      }
    }
    if (result) {
      var position123 = (result2 == true && result1 == true) ? 120 : result2 == true || result1 == true ? 130 : 145;
      if (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5) {
        // White image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUY5MjM3RDNEMEZGMTFFQzhENzY5MEVFMjQ3RUM5NjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MUY5MjM3RDREMEZGMTFFQzhENzY5MEVFMjQ3RUM5NjUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxRjkyMzdEMUQwRkYxMUVDOEQ3NjkwRUUyNDdFQzk2NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxRjkyMzdEMkQwRkYxMUVDOEQ3NjkwRUUyNDdFQzk2NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PouRfvsAAADISURBVHjaYvz//z/DQAAmhgECoxaPWowPOAPxYSB2JEs3KDuRga2A+PF/CHgExNakmkGOpWZA/PA/KngMdQzNLLaB+hAbeAbETsSaRWocZwHxJyC+AcS/oGIg+hYQvwXiTGINYiSxyJQFJQsglgDiFUCsDMQPgTgWiO+DzAPix8QYxEKij2GG/oFiEPgHxE+B+Ak9shMHkl5GKH+05Bq1eNTiUYsHt8Wg0ooZymaG8uli8U8gfgHE36D0d5JdPtqgH7WYVgAgwACdXzzrZBB4IAAAAABJRU5ErkJggg==';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + position123, position.y + 3, { fit: [15, 15] });
      } else {
        // blue image
        var image = 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzRFNDI3MEZEMEZGMTFFQ0JCM0U5ODkyMzZDRUEzNTQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzRFNDI3MTBEMEZGMTFFQ0JCM0U5ODkyMzZDRUEzNTQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDNEU0MjcwREQwRkYxMUVDQkIzRTk4OTIzNkNFQTM1NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDNEU0MjcwRUQwRkYxMUVDQkIzRTk4OTIzNkNFQTM1NCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvsvGSAAAAEDSURBVHja7JYxbsJAEEX/jCMhIU7AObhBmlyAIhRcAAnT0kGfxlWUO3GJFGmTgOQCwe7wjS3sdBHSgJTsl0Y7Gtt6ntnZ0YqZ4R5S3EkJfDM9/PbF3mgOg4DNmEVDwZCpIGckiij2m8IHfJFhYdFmdb3knf/y4l5qnrxxiLayMx+gv2YVnl3BhD6GEN8IHLTJox+CvfLZkxuY2eUEBbqfnfAXY4djjLljqWUqwDBTWXKNVYT+SgRDuhO3rqa+q31VRcmuNtSTtqQdqsxdm4sZ1t+0411FxPccq16a7OcGVHYFPM3qBE7g/wnOGkNn9ZtcHe1oHw10ey1Y0r06gf8c+CTAAHrHUyBmWiAMAAAAAElFTkSuQmCC';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + position123, position.y + 3, { fit: [15, 15] });
      }
    }
    if ((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].hasOwnProperty('extrapolation') && (itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].extrapolation.toString() == "true") {
      if (itemConfig.payload.nodeType.id == 4 || itemConfig.payload.nodeType.id == 5) {
        var image = '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';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 140, position.y + 4, { fit: [15, 15] });
      } else {
        var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RkMzMUFDNzY5RUQwMTFFQzhBRERFQjFCNkJGN0U4QUYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RkMzMUFDNzU5RUQwMTFFQzhBRERFQjFCNkJGN0U4QUYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmRpZDo2MDZFQTMzRUNDOUVFQzExQTIzOEEwRDA3RDM3NTEyQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MDZFQTMzRUNDOUVFQzExQTIzOEEwRDA3RDM3NTEyQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrDSWakAAAKRSURBVHjaYvz//z8DLQETA43BqAUDbwELMofNpOByTYJtIJB5B1n8y/cfDHcfvmAojnNEFmY+fvwYOyvj/z///v1n4OEX+MclJP0nyt8ZtwXAJCv24t0XFDFZMV44+8XbL8hSojN3Plv16fN3MSCbUVCQ52ltsrQPkP0NXxD9ZmNh/g/EDDCMDDbsu8TAxMjIIMDLxcDNxfEi0Fl/xcsXX9Vfvv2pdv/FF51jFx8yE4yD/0hYRpwXX/CqrNp5KRPoCkhQMDP95WRn/U/QApALYRgJeACxCRJfKalh7bYH91/rsHOxfTDQEG1iY2F88+//f1aCFvz++xeMFaX4YEKevQuPbt56/OFmIFsNiKUSG9dte/b4vSobH+eXYDvlcKBYfZiDamCok9Y3vKkIBH7++oPMda2Zsmc1MJGw/Pz+R2LziQc7dp998vPFk3fqLLzsP2I9NMO///i9C6r2DsFkCgPqcsIgyrFq0u7V//7+5+YX4nr049df7g9vvykCkxoDCxf7zzR//Yifv/9sIy2jAZ0qLsjzE8iyKZ2wa93vn3/4OblZH4Q7qdr35rv5s7AyfWdkYfpXFGUWDVSzEaRl+8n7DA9ffWZYtf8mg1fRMvw+AMYrMCUw8sxYf2bKr4/fBfgk+B46GUp5AaUegPCkMu/g56/fc//89Xft8j3XSM/JwDTG/O3nv7dlMdYJk5cd75GX4skChvktVmYmhqW7rjP8+ftvOxMTIwMzExMDKwsT6RawsDCzbTt2y+TPn7/XRUW5i87dfvUPKKxNQtHzF4hv4LTgz9+/7y/ffT39719gZPxn+MvMwsTMCAy3n7//wgKRAZiCgcn4P8MPuBhSEDMwfABSuihio1Xm8LcAIMAAGkgAidc+hToAAAAASUVORK5CYII=';
        doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 140, position.y + 4, { fit: [15, 15] });
      }
    }
    if (itemConfig.payload.nodeType.id == 5) {
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAB9ElEQVRIib2Vz4tOURyHnzMsDJq1hmE0JRJJaGIxZC3pLU0JRRGlyUIWo/wFavJjM8nSiiSjmSzYjBUzmEERG/JjI41ilo/Fe95c5733fe9taj711n3v+Xw/z/eee865gZJSA3Aw/r0fQrBsbdtgtaa+Uh+rT+J1LUIXFHxAnVIn1f2ZsT3qA/W1ekxdUjV8bezymTrQwjegPldn1O48T0dB7TpgFdADHMorjvdqwGZgC9BXBQAwDWwC5oBpdUTtjr8R4CNwDljWIqMlgBDCzxDC5QxoCvgADLULLgXIAV0HOsvUVAIsRIsPUHuBs8A2dVAt28SZWJsPUHvVUeAp8BI4ApwAZtuAJoB9wAtgUr2prv+vY3VU/aJeVFcmT7RbfaS+USf8p3G1P/GuUC/ErFtqH+qfeGNj0bOrHerVTPiVVlOnblA/q/Oo8+ol9at6Q12TBA/G7hu6rY6ps+rhLEhdrV6Lmaqi/o6DXQnoeBLc0HD0b1fvxXPoaBrcBMh00WX9WCjScOLfqr4vMjfNYwjhF3C3aH5z/DPUz6VcLcpGC1b7YCytChgD3lruy/QdOGljjbfXHQDUnXHpvYsrYm/yrr6p59Xlaqc6pH5qgKxvuqzG1V1NuAzoRxqc482C5qL/ocnuzlUEnc4LLgCdUnfkjf8FoF6aqhO9IcEAAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 180, position.y + 6, { fit: [10, 10] });
    } else if (itemConfig.payload.nodeType.id == 4) {
      if((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].fuNode.usageType.id == 2){
        doc
        .font('Helvetica-Bold', 14)
        .fillColor('white')
        .text("c", position.x + 160, position.y + 6, {
          ellipsis: false,
          width: 12,
          height: 74,
          align: 'center'
        });
      }else{
        doc
        .font('Helvetica-Bold', 14)
        .fillColor('white')
        .text("d", position.x + 160, position.y + 6, {
          ellipsis: false,
          width: 12,
          height: 74,
          align: 'center'
        });
      }
      var image = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA/klEQVRIie2WoUpEQRhGzy+rbW2yyWAx+BZGg/gGCmvwKSyCzegTGCyGTYLN5KJdwSBWg4KgwZUbjmWE1b3e3R3vbXvaMP/3nYGBYVBv/R8D9VANSgjVofUT8FE2WMES0AbOgJ2I+Jn/dZq+ujhNu7qi3qX8tdqpEuRK2up5yj+qa1WCXElLPU75N3UDRu9gmBugN40k0QVWgQLYqxLUQdEaM3ACXGWWHwCdv+7gm25mOeq96lxuwaTMBDNBPYLPpgVHTQv2gdPGBBEhsAv0GxEARMQA2AIeGhEkyQuwCbzWKRj5CajrwAWwADwD75ndy8B86Y66rRZjnvJJuPwCIu9bEKiU654AAAAASUVORK5CYII=';
      doc.image(new Buffer(image.replace('data:image/png;base64,', ''), 'base64'), position.x + 175, position.y + 6, { fit: [10, 10] });
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
    /* description */
    if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
      doc
        .font('Helvetica', 12)
        .fillColor('black')
        .text(addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue), position.x, position.y + 42, {
          ellipsis: false,
          width: (contentSize.width - 4),
          height: 74,
          align: 'center'
        });
    } else {
      var text = "";
      if (itemConfig.payload.nodeType.id == 4) {
        text = addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue) + "% of parent, " + addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].fuPerMonth) + "/" + 'Month';
      } else if (itemConfig.payload.nodeType.id == 5) {
        text = addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue) + "% of parent, conversion = " + (itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].puNode.planningUnit.multiplier;
      } else {
        text = addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayDataValue) + "% of parent";
      }
      doc
        .font('Helvetica', 12)
        .fillColor('black')
        .text(text, position.x, position.y + 42, {
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
        .text("= " + ((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayCalculatedDataValue != null ? addCommas((itemConfig.payload.nodeDataMap[itemConfig.scenarioId])[0].displayCalculatedDataValue) : ""), position.x, position.y + 64, {
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
      var yPosition = position.y + 93;
      if (itemConfig.payload.nodeType.id == 1 || itemConfig.payload.nodeType.id == 2) {
        yPosition = position.y + 64;
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