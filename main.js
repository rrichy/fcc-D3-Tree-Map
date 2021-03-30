const SVG_DIM = {W: 960, H: 570, PADDING: 1};

const DATASETS = {
    videogames: {
      TITLE: 'Video Game Sales',
      DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
      FILE_PATH: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
      LINK_DESC: 'Video Game Data Set'
    },
    movies: {
      TITLE: 'Movie Sales',
      DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
      FILE_PATH: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
      LINK_DESC: 'Movies Data Set'
    },
    kickstarter: {
      TITLE: 'Kickstarter Pledges',
      DESCRIPTION:
        'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
      FILE_PATH: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
      LINK_DESC: 'Kickstarter Data Set'
    }
};

const container = d3.select('body')
        .append('div')
        .attr('id', 'container');

container.append('p')
    .selectAll('u')
    .data([DATASETS.videogames, DATASETS.movies, DATASETS.kickstarter])
    .enter()
    .append('u')
    .text(d => d.LINK_DESC)
    .on('click', (e, d) => main(d))

const wrapper = container.append('div').attr('id', 'wrapper');

const DEFAULT = DATASETS.kickstarter;

main(DEFAULT);


function main(link){
    d3.json(link.FILE_PATH)
        .then(data => {
            wrapper.html('')
            // declare root
            const root = d3.treemap()
                .size([SVG_DIM.W, SVG_DIM.H])
                .paddingInner(SVG_DIM.PADDING)
                (d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort((a, b) => b.value - a.value));

            // title
            wrapper
                .append('h1')
                .attr('id', 'title')
                .text(link.TITLE);

            // description
            wrapper
                .append('h2')
                .attr('id', 'description')
                .text(link.DESCRIPTION);

            // svg
            const svg = wrapper
                .append('svg')
                .attr('width', SVG_DIM.W)
                .attr('height', SVG_DIM.H);

            // color
            let color = {};
            for(let [key, category] of Object.entries(data.children.map(a => a.name))){
                color[category] = d3.schemeAccent.concat(d3.schemePaired)[key];
            }

            // tile
            const tile = svg.selectAll('.tile-container')
                .data(root.leaves())
                .enter()
                .append('g')
                .attr('class', 'tile-container')
                .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

            // rect
            tile.append('rect')
                .attr('class', 'tile')
                .attr('width', d => d.x1 - d.x0)
                .attr('height', d => d.y1 - d.y0)
                .attr('fill', 'green')
                .attr('data-name', d => d.data.name)
                .attr('data-category', d => d.data.category)
                .attr('data-value', d => d.data.value)
                .attr('fill', d => color[d.data.category])
                
            // text
            const text = tile.append('text')
                .style('font-size', 12);

            text.selectAll('tspan')
                .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
                .enter()
                .append('tspan')
                .text(d => d)
                .attr('x', 4)
                .attr('y', (d, i) => 15 + i * 14);

            // legend
            const legendContainer = wrapper
                .append('svg')
                .attr('id', 'legend')
                .style('display', 'block')
                .attr('width', SVG_DIM.W)
                .attr('height', 150);

            const legendWrapper =  legendContainer.selectAll('g')
                .data(data.children.map(a => a.name))
                .enter()
                .append('g')
                .attr('class', 'legend-wrapper')
                .attr('transform', (d, i) => `translate(${35 + i % 6 * 150}, ${14 + Math.floor(i/6) * 23})`);

            legendWrapper.append('text')
                .text(d => d)
                .attr('x', 14)
                .attr('y', 5)
                .attr('dy', '.35em')

            legendWrapper.append('rect')
                .attr('class', 'legend-item')
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', d => color[d])
            
            // tooltip
            const tooltip = wrapper
                .append('div')
                .attr('id', 'tooltip')
                .style('opacity', 0);

            tile.on('mousemove', (e, d) => {
                tooltip.style('opacity', .8)
                    .attr('data-value', d.data.value)
                    .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${Number(d.data.value).toLocaleString()}`)
                    .style('top', (e.pageY - document.getElementById('tooltip').offsetHeight/2) + 'px')
                    .style('left', (e.pageX + 5) + 'px')
                })
                .on('mouseout', () => {
                    tooltip.style('opacity', 0)
                        .html('')
                });
        });
}