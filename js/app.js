var app = new Vue({
  el: '#projects',
  data: {
    message: 'Hello Vue!',
    projects: []
  },
  methods: {
  	bringProjectsFromFirebase:function(){
  		projects.push("proyecto1")
  	}
  }
})