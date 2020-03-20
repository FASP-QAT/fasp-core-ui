export default function getLabelText(label, lang) {
    if (lang == 'en') {
        return label.label_en;
    } else if (lang == 'fr' && label.label_fr != null) {
        return label.label_fr;
    } else if (lang == 'sp' && label.label_sp != null) {
        return label.label_sp;
    } else if (lang == 'pr' && label.label_pr != null) {
        return label.label_pr;
    } else {
        return label.label_en;
    }
}