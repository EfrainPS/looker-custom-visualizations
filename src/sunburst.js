//this sunburst is an adapted library. You need generate the module and added to node_module folder from this repositorie https://github.com/EfrainPS/sunburst-chart-js
import Sunburst from 'sunburst-chart';
import * as d3 from 'd3'

//Definiciones Globales
const colorBy = {
    NODE: 'node',
    ROOT: 'root'
}

let vis = {
    options: {
        color_by: {
            type: 'string',
            label: 'Color by',
            display: 'select',
            values: [
                { 'Color by Root': colorBy.ROOT },
                { 'Color by Node': colorBy.NODE }
            ],
            default: colorBy.ROOT
        },
        color_range: {
            type: 'array',
            label: 'Color Range',
            display: 'colors',
            default: ['#4285F4', '#EA4335', '#FBBC04', '#34A852', '#5F6368']
        },
        show_labels: {
            type: 'boolean',
            label: 'Show Label',
            default: false
        }
    },
    create: function (element) {
        const visContainer = document.createElement("div")
        visContainer.setAttribute("id", "vis-container");
        visContainer.style.height = "100%";
        element.appendChild(visContainer);

        const donutContainer = document.createElement("div")
        donutContainer.setAttribute("id", "sunburst-container");
        donutContainer.style.height = "100%";
        visContainer.append(donutContainer)

    },
    updateAsync: function (data, element, config, queryResponse, details, doneRendering) {
        this.clearErrors();

        // Se valida que tenga más de una dimensión, utilice solo una medida y que sea de tipo numerico
        const hasOneDimension = queryResponse.fields.dimensions.length > 0;
        const hasOneMeasure = queryResponse.fields.measures.length === 1;
        const isMeasureNumeric = queryResponse.fields.measures[0]?.is_numeric;

        if (!hasOneDimension || !hasOneMeasure || !isMeasureNumeric) {
            this.addError({
                title: "Incompatible Data",
                message: "This chart requires one or more dimensions and one numerical measure.",
            });
            return;
        }

        //Obtenemos las dimensiones disponibles en orden
        let dimensions = []
        queryResponse.fields.dimensions.map(dim => dimensions.push(dim.name))

        //Obtenemos el nombre de la dimensión usada
        const measure = queryResponse.fields.measures[0].name

        //Funcion para obtener los objetos a cierto nivel de profundidad dentro de un objeto
        function GetElementsDepth(object, expectedDepth, lisDimensionValues, depth = 1) {
            let expectedObject = object

            for (depth; depth < expectedDepth; depth++) {
                expectedObject = expectedObject.find(elemet => elemet['name'] === lisDimensionValues[depth - 1]).children
            }

            return (expectedObject)
        }

        //Funcion para asignar opacidad según el nivel de profundidad
        function addTransparencyByDepth(hexCode, totalDepth, depth) {

            if (totalDepth === 1) {
                return `${hexCode}FF`
            }

            const equalParts = Math.round(80 / (totalDepth))
            const equivalentPart = 100 - equalParts * (depth - 1)

            return `${hexCode}${equivalentPart}`
        }


        let chart_data = []

        let numberDimension = 0
        dimensions.map((dim) => {

            // Se ejecuta cuando solo existe una dimension
            if (dimensions.length === 1) {
                data.map((row) => {
                    const name = row[dim].value
                    const validator = chart_data.filter(e => e['name'] === name)

                    if (validator == 0) {
                        chart_data.push({
                            name: name,
                            value: row[measure].value
                        })
                    }
                })
            }

            // Iteración inicial para sacar los nodos padres
            if (numberDimension === 0) {
                data.map((row) => {
                    const name = row[dim].value
                    const validator = chart_data.filter(e => e['name'] === name)

                    if (validator == 0) {
                        chart_data.push({
                            'name': name,
                            'children': []
                        })
                    }
                })
            }

            // Ultima iteración
            else if (numberDimension === dimensions.length - 1) {
                data.map((row) => {
                    let listDimensionsPrev = []
                    dimensions.map(
                        (name, index) => {
                            if (index < numberDimension) {
                                listDimensionsPrev.push(row[name].value)
                            }
                        }
                    )
                    let parentObject = GetElementsDepth(chart_data, numberDimension, listDimensionsPrev)

                    const parentName = row[dimensions[numberDimension - 1]].value
                    const name = row[dim].value
                    const parent = parentObject.find(p => p['name'] === parentName)

                    parent.children.push({
                        'name': name,
                        'value': row[measure].value
                    })
                })
            }

            //Iteraciones del medio
            else {
                data.map((row) => {
                    let listDimensionsPrev = []
                    dimensions.map(
                        (name, index) => {
                            if (index < numberDimension) {
                                listDimensionsPrev.push(row[name].value)
                            }
                        }
                    )
                    let parentObject = GetElementsDepth(chart_data, numberDimension, listDimensionsPrev)

                    const parentName = row[dimensions[numberDimension - 1]].value
                    const name = row[dim].value
                    const parent = parentObject.find(p => p['name'] === parentName)

                    const validator = parent.children.filter(e => e['name'] === name)

                    if (validator == 0) {
                        parent.children.push({
                            'name': name,
                            'children': []
                        })
                    }

                })
            }

            numberDimension++
        })

        // Se prepara la entrada de datos para el gráfico
        const chart_data_sunburst = {
            "name": "Total",
            children: chart_data
        }

        // Configuración del gráfico
        document.getElementById('sunburst-container').innerHTML = ""
        const width = element.clientWidth
        const height = element.clientHeight

        // Definición de colores
        const color = d3.scaleOrdinal(config.color_range);

        // Despliegue de gráfico con configuraciones visuales
        const myChart = Sunburst();
        myChart
            .data(chart_data_sunburst)
            .width(width)
            .height(height)
            .color(d => {
                if (config.color_by === colorBy.NODE) {
                    return color(d.name)
                }
                else {
                    const depth = d.__dataNode.depth

                    if (depth == 0) {
                        return color(d.name)
                    }
                    else if (depth == 1) {
                        return `${color(d.name)}`
                    } 
                    else {
                        let newObject = d
                        for (let i = 1; i < depth; i++) {
                            newObject = newObject.__dataNode.parent.data
                        }
                        return addTransparencyByDepth(
                            color(newObject.name),
                            numberDimension,
                            depth
                        )
                    }
                }
            })
            .label((node) => `${node.name}`)
            .tooltipTitle((d) => `${d.name}`)
            .tooltipContent((d, node) => `Value: <i>${node.value.toLocaleString()}</i>`)
            .excludeRoot(true)
            .showLabels(config.show_labels)
            .handleNonFittingLabel((label, availablePx) => {
                const numFitChars = Math.round(availablePx / 7); // ~7px per char
                return numFitChars < 5
                    ? null
                    : `${label.slice(0, Math.round(numFitChars) - 3)}...`;
            })
            (document.getElementById('sunburst-container'));

        doneRendering();
    },
}

looker.plugins.visualizations.add(vis);
