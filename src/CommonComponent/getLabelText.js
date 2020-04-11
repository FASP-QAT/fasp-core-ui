export default function getLabelText(label, lang) {
    if (lang == 'en') {
        return label.label_en;
    } else if (lang == 'fr' && label.label_fr != null && label.label_fr != '') {
        return label.label_fr;
    } else if (lang == 'sp' && label.label_sp != null && label.label_sp != '') {
        return label.label_sp;
    } else if (lang == 'pr' && label.label_pr != null && label.label_pr != '') {
        return label.label_pr;
    } else {
        return label.label_en;
    }
}