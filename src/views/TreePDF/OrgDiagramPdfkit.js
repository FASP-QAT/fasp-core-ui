import AnnotationLabelTemplate from './AnnotationLabelTemplate';
import CheckBoxTemplate from './CheckBoxTemplate';
import CursorTemplate from './CursorTemplate';
import CustomRenderTemplate from './CustomRenderTemplate';
import DummyTemplate from './DummyTemplate';
import GroupTitleTemplate from './GroupTitleTemplate';
import HighlightTemplate from './HighlightTemplate';
import ItemTemplate from './ItemTemplate';
import LabelAnnotationTemplate from './LabelAnnotationTemplate';
import LevelBackgroundTemplate from './LevelBackgroundTemplate';
import LevelTitleTemplate from './LevelTitleTemplate';
import UserTemplate from './UserTemplate';
import OrgPdfkitTaskManagerFactory from '../../../node_modules/basicprimitives/src/OrgPdfkitTaskManagerFactory';
import BasePdfkitPlugin from './BasePdfkitPlugin';
/**
 * Creates PDFKit Organizational Chart Plugin
 * @class OrgDiagramPdfkit
 * 
 * @param {OrgConfig} options Organizational Chart Configuration object
 * 
 * @returns {OrgDiagramPdfkit} Returns reference to Organizational Diagram PDFKit renderer instance.
 */
export default function OrgDiagramPdfkit(options, templates) {
  return BasePdfkitPlugin(options, OrgPdfkitTaskManagerFactory, {
    AnnotationLabelTemplate,
    ButtonsTemplate: DummyTemplate,
    CheckBoxTemplate,
    CursorTemplate,
    CustomRenderTemplate,
    DotHighlightTemplate: DummyTemplate,
    GroupTitleTemplate,
    HighlightTemplate,
    ItemTemplate,
    UserTemplate,
    LevelTitleTemplate,
    LevelBackgroundTemplate,
    LabelAnnotationTemplate,
    ...templates
  });
};
