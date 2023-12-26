export function calculateModelingData(dataset, props, page) {
            if (page == "syncPage") {
                props.fetchData(1, dataset.id);
            } else {
                props.updateState("loading", false);
            }
}