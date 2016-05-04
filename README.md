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
8. adding a jquery plugin, edit config.js, Gruntfile.js (requirejs and jasmine) and play.html
9. Never call yourself prompt.call(this, opt). if will dead loop. e.g. getMember() to Prompt and use Prompt.call(this, opt)
10. When inherit keep name with suffix _specific customized
11. In the customized level, give arguments with setOpt();