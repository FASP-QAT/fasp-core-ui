/**
 * This function is called from the sync page
 * @param {*} dataset This is the dataset json that user has downloaded
 * @param {*} props This is the props of the page from which this function is called 
 * @param {*} page This is the name of the page from which this function is called  
 */
export function calculateModelingData(dataset, props, page) {
            if (page == "syncPage") {
                props.fetchData(1, dataset.id);
            } else {
                props.updateState("loading", false);
            }
}