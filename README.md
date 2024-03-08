# Donut Chart - Looker Custom Visualization

A basic donut chart with the total/aggregate value shown in the center of the donut. 
Much of the formatting (font size, spacing, etc.) is customizable by the user in the config options.

This chart is a good starting place for any other custom donut or pie chart visualizations, since Looker does not make the source code 
for their native visualizations available.

This visualization uses the Chart.js data visualization library for the donut chart.  
https://www.chartjs.org/docs/latest/charts/doughnut.html

<img width="842" alt="image" src="https://user-images.githubusercontent.com/93162346/182886673-3c437feb-c4cc-4b4b-9896-c88511c74b0c.png">

## Development
Spin up a local development server hosting the visualization JavaScript file with
`npm install` and `npm start`.

To view this custom visualization in your Looker instance, add a `visualization` parameter to your project's `manifest.lkml` file, with the visualization's `url` parameter set to `https://localhost:8080/bundle.js` (more details [here](https://cloud.google.com/looker/docs/reference/param-manifest-visualization)).
**Deploy this change to production**, navigate to an explore in your instance, and under the visualizations tab choose the new custom visualization
that you defined. You may need to set your browser to allow localhost's https certificate (navigate to `https://localhost:8080/bundle.js` > advanced > proceed)

To make changes to the visualization, edit `src/customVis.js` locally, save your changes, and you should see them updated in the Looker explore (the webpack development server will automatically re-build and re-serve the JavaScript file on save).

<img width="557" alt="image" src="https://user-images.githubusercontent.com/93162346/192617937-c4f2ce7b-6ee8-4bd4-9466-8b2fbb3ea718.png">
<img width="1196" alt="image" src="https://user-images.githubusercontent.com/93162346/192617391-e624a2ea-9b30-44dd-ae47-c28c1c86faf7.png">

## Production
When you are finished with development, run `npm run build` to create a production build of the visualization. Drag and drop the newly created `bundle.js` file in the `dist/` folder to your LookML project. Set the `file` parameter in your `visualization` parameter in the manifest file to point to your new production bundle (described in more detail [here](https://cloud.google.com/looker/docs/reference/param-manifest-visualization)). Save and **deploy your LookML** changes, and your deployed visualization should pull its JavaScript from the deployed `bundle.js` file in your LookML project.