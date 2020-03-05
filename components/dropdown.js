const dropdown = (reference, model = [], id, label) => {

    const config = {
        id,
        label,
        containerList: null,
        button: null,
        reference: $(reference),
        model: JSON.parse(JSON.stringify(model)),
        styleId: "dropdown",
        css: `.dropdown-item:focus, .dropdown-item:hover { color: #fff; text-decoration: none; background-color: #007bff; }
            .dropdown-menu { width: 100%; max-height: 200px; overflow: auto; min-width: initial; }
            .dropdown { min-width: 80px; width:100%; text-align:left; }
            .dropdown-toggle::after { position: relative; top: 8px; float: right; }`
    }

    const create = selected => {
        load();

        if (selected != undefined)
            createSelected(selected);

        loadCss();
        loadEvents();
    }

    const load = () => {
        const { reference } = config;
        const drop = reference.find(".dropdown");

        if (drop.length > 0)
            drop.remove();

        reference.append(template());
        config.containerList = reference.find(".dropdown");
        config.button = reference.find(".dropdown-toggle");
    }

    const createSelected = selected => {
        const { containerList, button } = config;
        const newLabel = containerList.find("a").filter((i, e) => e.id == selected);
        button.html(newLabel.html());
        button.attr("value", selected);
    }

    const template = () => {
        const { model, id, label } = config;
        return `
        <div class='dropdown'>
            <button class='btn btn-secondary btn-sm dropdown-toggle' type='button' style='width:100%; text-align:left' data-toggle='dropdown' aria-haspopup="true" aria-expanded="false">Selecione</button>
            <div class='dropdown-menu'>
            ${model.map(item => `<a class="dropdown-item" href='#' id="${item.id == 0 ? 0 : item.id || (item[id] + '')}">${item[label] || item.label}</a>`).join("")}
            </div>        
        </div
        `
    }

    const loadEvents = () => {
        config.containerList.find("a").off().click((e) => {
            const { model, id, callback } = config;
            updateButtonText(e);
            const obj = {};
            obj[id || 'id'] = parseInt(e.target.id);
            const item = _.find(model, obj);

            if (callback) {
                callback(item)
            }
        });
    }

    const loadCss = () => {
        const { styleId, css } = config;
        if ($(document.head).find("style#" + styleId).length === 0) {
            const styleSheet = document.createElement("style");
            styleSheet.type = "text/css";
            styleSheet.innerText = css;
            styleSheet.setAttribute("id", styleId);
            document.head.appendChild(styleSheet);
        }
    }

    const updateButtonText = e => {
        const { button, containerList } = config;
        const element = $(e.target);
        const id = element.attr("id");
        const text = element.html();

        button.attr("value", id).html(text);

        containerList.find("a").map(() => {
            if ($(this).html() == "Selecione") {
                $(this).remove()
            }
        });
    }

    const getItem = () => {
        const { id, model } = config;
        const obj = {};
        obj[id || 'id'] = parseInt(this.getId());

        if (_.find(model, obj) !== undefined) {
            let index = _.findIndex(model, obj);
            return model[index];
        }
        return null;
    }

    const setDropdown = idDrop => {
        const { containerList, button, id, model, callback } = config;
        const findId = containerList.find("a").filter((i, e) => $(e).attr("id") == idDrop)

        if (findId.length > 0) {
            button.html(findId.html()).attr("value", findId.attr("id"));
            let obj = {};
            obj[id || 'id'] = idDrop;
            if (callback) {
                callback(_.find(model, obj))
            }
        }
    }

    const setDropdownByIndex = index => {
        const { containerList, button, id, model, callback } = config;
        const findIndex = containerList.find("a").eq(index);

        if (findIndex.length > 0 && index != -1) {
            button.html(findIndex.html()).attr("value", findIndex.attr("id"));
            if (callback) {
                callback(model[index])
            }
        }
    }

    const showFilter = () => {
        const { containerList } = config;
        const filter = $("#dropdown-filter");
        const template = "<div id='dropdown-filter' class='px-2 mb-1'><input class='form-control form-control-sm' type='text' placeholder='Pesquisar'></div>";
        if (filter.length > 0) {
            filter.remove();
        }
        $(template).insertBefore(containerList.find("a").eq(0));
        $("#dropdown-filter input").off().on("keyup", (e) => filterList(e));
    }

    const filterList = e => {
        const ref = $(e.currentTarget);
        const word = ref.val().toUpperCase();
        const itens = config.containerList.find("a");
        const regex = new RegExp();

        itens.each((i, element) => {
            let _self = element;
            regex.compile(word)
            regex.test($(_self).text().toUpperCase()) ? $(_self).show() : $(_self).hide();
        });
    }

    const updateDropdown = newItem => {
        if (Array.isArray(newItem)) {
            config.model = newItem
            create();
        } else if (typeof (newItem) == "object") {
            const obj = {};
            const { id, label, model, containerList } = config;
            obj[id || 'id'] = parseInt(newItem.id);

            if (_.find(model, obj) != undefined) {
                let index = _.findIndex(model, obj);
                model[index].label = newItem.label;
                containerList.find("a")[index].text = newItem.label;
            } else {
                model.push(newItem);
                let newElement = `<a class="dropdown-item" href='#' id="${newItem[id] || newItem.id}">${newItem[label] || newItem.label}</a>`;
                $(newElement).appendTo(containerList.find(".dropdown-menu"));
                loadEvents();
            }
        } else {
            return
        }
    }

    return {
        create,
        updateDropdown,
        setDropdown,
        setDropdownByIndex,
        showFilter,
        getItem,
        disableDropdown: (flag = false) => config.button.prop("disabled", flag),
        callback: func => config.callback = func,
        getId: () => config.button.attr("value"),
        getLabel: () => config.button.html(),
        getItemByIndex: index => config.model[index]
    }
}

export default dropdown;
