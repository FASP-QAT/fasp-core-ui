import AnnotationLabelTemplate from './AnnotationLabelTemplate';
import CheckBoxTemplate from './CheckBoxTemplate';
import CustomRenderTemplate from './CustomRenderTemplate';
import CursorTemplate from './CursorTemplate';
import DummyTemplate from './DummyTemplate';
import GroupTitleTemplate from './GroupTitleTemplate';
import HighlightTemplate from './HighlightTemplate';
import ItemTemplate from './ItemTemplate';
import UserTemplate from './UserTemplate';
import LabelAnnotationTemplate from './LabelAnnotationTemplate';
import LevelTitleTemplate from './LevelTitleTemplate';
import LevelBackgroundTemplate from './LevelBackgroundTemplate';

import BasePdfkitPlugin from './BasePdfkitPlugin';
import OrgPdfkitTaskManagerFactory from '../../../node_modules/basicprimitives/src/OrgPdfkitTaskManagerFactory';

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
    /* FamDiagram specific templates */
    LabelAnnotationTemplate,
    ...templates
  });
};
