'use strict';
const assert = require('node:assert/strict');
const {createNavigation} = require('../assets/navigation.js');
function largeFixture() {
  const nodes = [], edges = [];
  for (let i = 0; i < 2500; i++) {
    const domain = ['accounts','payments','verify','identity','risk','notifications','billing','teams','devices','monitoring'][i % 10];
    const file = `api/src/${domain}/file${i}.ts`, mid = 'file:' + file;
    nodes.push({id:mid,label:file,kind:'module',file,line:1,endLine:100});
    for (let j = 0; j < 17; j++) {
      const id = mid + '/f' + j;
      nodes.push({id,label:`function${j}_${i}`,kind:'function',file,parent:mid,line:j+1,endLine:j+2});
      edges.push({source:mid,target:id,type:'contains',confidence:'resolved',evidence:{file,line:j+1}});
      if (j) edges.push({source:id,target:mid+'/f'+(j-1),type:'calls',confidence:'resolved',evidence:{file,line:j+1}});
    }
    if (i) edges.push({source:mid,target:nodes[(i-1)*18].id,type:'imports',confidence:'resolved',evidence:{file,line:1}});
  }
  const target = nodes[1].id;
  for (let i = 0; i < 1000; i++) { const id = 'endpoint:'+i,file=nodes[i*18].file;nodes.push({id,label:`POST /api/action-${i}`,kind:'endpoint',file,line:1,endLine:2,parent:nodes[0].id}); edges.push({source:id,target,type:'registers handler',confidence:'resolved',evidence:{file,line:1}}); }
  for (let i = 0; i < 100; i++) edges.push({source:target,target:nodes[i*18+2].id,type:'calls',confidence:'resolved',evidence:{file:nodes[1].file,line:1}});
  for (let i=0;i<26000;i++) edges.push({source:nodes[i].id,target:nodes[i+37].id,type:'calls',confidence:'resolved',evidence:{file:nodes[i].file,line:1}});
  return {schemaVersion:2,meta:{name:'large-api',files:2500,generatedAt:new Date().toISOString(),localRoot:'/tmp/large-api',warnings:[],unresolvedCalls:0,findingsImported:0,findingsUnmatched:0},nodes,edges};
}
if (require.main === module) {
  const graph=largeFixture(),start=performance.now(),nav=createNavigation(graph);
  assert(graph.nodes.length>=44000);assert(graph.edges.length>110000);
  assert.equal(nav.children('').length,1);assert.equal(nav.children('api/src').length,10);
  const reset=nav.children('');assert.equal(reset[0].files,2500);assert.equal(reset[0].endpoints,1000);
  assert.equal(nav.catalog({mode:'endpoints'}).length,1000);
  const root=graph.nodes[1].id,trace=nav.focused(root,'both',1,12);
  assert(trace.nodes.length<=13);assert(trace.hidden>1000);
  assert(trace.edges.some(e=>e.source===root));assert(trace.edges.some(e=>e.target===root));
  const visible=nav.children('api/src').map(n=>n.id),aggregates=nav.aggregateEdges('api/src',visible);
  assert(aggregates.length>0);assert(aggregates.every(e=>e.count>0&&e.source!==e.target));
  assert.equal(nav.catalog({mode:'all',query:'function16_2499'}).length,1);
  console.log(`PASS: ${graph.nodes.length.toLocaleString()} nodes / ${graph.edges.length.toLocaleString()} relationships; bounded overview, folder aggregation, endpoint catalog, balanced focused trace and indexed navigation (${Math.round(performance.now()-start)}ms).`);
}
module.exports={largeFixture};
