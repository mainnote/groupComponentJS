# mainnoteJS
A set of browser components based on groupJS

How to define your own template?
1. Instance the component
2. component.tpl = new.tpl
3. override the component back to its group
4. $(window).scroll doesn't bubble so we need to build for one event
5. Check members in debug console: 
require(['memberName'], function(Member){console.log(Member.members());});

6. setOpt() if necessary
7. each iterable object should be created, each click of fetch should be created
