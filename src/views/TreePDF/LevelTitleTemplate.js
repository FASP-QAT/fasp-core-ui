import { TextOrientationType } from '../../../node_modules/basicprimitives/src/enums';
import { renderRotatedText } from '../TreePDF/RotatedText';
export default function LevelTitleTemplate(options, orientation) {
  var {levelTitleFontSize, 
    levelTitleFontFamily: fontFamily,
    levelTitleFontWeight: fontWeight,
    levelTitleFontStyle: fontStyle,
    levelTitleFontColor,
    levelTitleOrientation: textOrientation,
    levelTitleHorizontalAlignment: horizontalAlignment,
    levelTitleVerticalAlignment: verticalAlignment,
    levelTitleColor    
  } = options;
  function template() {
    return {};
  }
  function getHashCode() {
    return 0;
  }
  function render(doc, position, data) {
    var config = data.context,
      titleColor = config.titleColor || levelTitleColor,
      label = config.title,
      fontColor = config.titleFontColor || levelTitleFontColor;
      textOrientation = TextOrientationType.RotateLeft;
    var fontSize = parseInt(levelTitleFontSize, 10);
    position.width=30;
    position.height=127;
    renderRotatedText({doc, textOrientation, label, fontSize, fontColor, position, titleColor, horizontalAlignment, verticalAlignment });
  }
  return {
    template: template,
    getHashCode: getHashCode,
    render: render
  };
};
