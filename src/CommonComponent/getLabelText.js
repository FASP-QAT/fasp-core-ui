/**
 * This function is used to display a particular text in the language that is requested by the user
 * @param {*} label This is the text that needs to be displayed
 * @param {*} lang This is the language in which the text needs to be displayed
 * @returns This function returns the text in specified language
 */
export default function getLabelText(label, lang) {
    if (lang == 'en') {
        return label.label_en;
    } else if (lang == 'fr' && label.label_fr != null && label.label_fr != '' && label.label_fr != "NULL" && label.label_fr != "null") {
        return label.label_fr;
    } else if (lang == 'sp' && label.label_sp != null && label.label_sp != '' && label.label_fr != "NULL" && label.label_fr != "null") {
        return label.label_sp;
    } else if (lang == 'pr' && label.label_pr != null && label.label_pr != '' && label.label_fr != "NULL" && label.label_fr != "null") {
        return label.label_pr;
    } else {
        return label.label_en;
    }
}