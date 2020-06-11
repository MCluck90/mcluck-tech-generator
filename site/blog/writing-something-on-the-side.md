---
title: Writing something on the side
description: The only way to get better at programming is by doing it.
date: 2018-04-20
tags: ['getting started', 'side project']
---

This article is going to be all over the place. I've talked to a lot of people recently who seem to be struggling with finding a project to work on in their spare time. This is a rough compilation of my thoughts on the matter.

Side projects are a great way to hone your skills, build something to help yourself, or just pump up your resume. They also, rarely, come out of nowhere. It's not often that you're just struck with the perfect idea of what you want to build. It does happen but I've got a number of ideas and approaches which may help you get that kick-start when you're lacking in the inspiration department. I've listed these in order of ease. The earlier things will be easier to get into and complete. The later ones will take more work but will reap greater rewards if completed. Without further ado, here's 4 ways to get started on a side project.

<!-- more -->

## 1. Practice

As with any craft, practice is the only way to get better at programming. No one has ever just woken up as a top-notch programmer. Some may catch on quicker than others but it really comes down to just putting in the time. Just picking something to practice on can also lead to a very interesting side project. I think of practice projects in two different categories:

* Beginner
* Everyone Else

### Beginner

If you're just getting started with programming, there's a few problems that I think you should tackle. The first is the famous Fizz Buzz problem. This one has been used in a number of interviews around the world and teaches you to think iteratively. There are a vast number of resources explaining how to approach this so I'll leave it to you and your Google-Fu to learn more about the problem.

After you've got that down, I'd recommend making a [text-based adventure.][13] It doesn't have to be huge or involved. Just something as simple as a tour through a section of Hogwarts or escorting a caravan through a forest. At the basic level, you need to design a sort of map then take input from the user to walk them through that map. Don't worry about graphics. Describe everything with text. The commands you take from the user can be very simple as well. Common conventions include `go w` to walk to the west or `look n` to describe what is to the north of the player. See if you can do this without a never ending series of `if-else` calls. Trying to write such a game with just `if-else`s is a real pain-in-the-ass (thanks Past Me for learning that lesson). If you get the whole map and walking system worked out to your liking, you might try adding basic combat. That will give you a chance to track more data about the player as well as any enemies they encounter. It's also a good intro to random numbers since you likely would want a random chance of attacks connecting with the target.

### Everyone Else

If you've gotten to this point, you've likely got a couple of data structures under your belt and have at least a really rough idea of what you know and what you don't. There's two major ways to go from here.

1. Learn about something you know almost nothing about
2. Implement something that you think "well, yeah, I could do that"

Learning something completely new is always a great way to flex your skills. Here are a few things you might try:

1. Learn a new data structure

    * [Binary tree][5], [quadtree][6], [hash map][7], [ropes][8], etc.

2. Learn a new language

    * Pick something you already know how to build and try to write it in that language using the conventions of that language.

3. Implement a particular algorithm

    * [Dijkstra's algorithm][9], [Flood fill][10], [Levenshtein distance][11], etc.

4. Try an intro to a subject you're unfamiliar with

    * AI, Game development, microcontrollers, etc.

5. Recreate an existing piece of software

    * Text editor, Unix command line tools, etc.

For me, I frequently see something that already exists or just come up with an idea of my own and think "yeah, I could do that" despite having never done it before or at most having done a much simpler version of it. One that comes to mind was an [isometric camera system][2]. It seemed pretty simple from the outside but once I dug into it, I found a lot of interesting sub-problems that I hadn't experienced when doing simple [top-down][3] camera systems. At the end of the project, I proved to myself that, yes, I really could build such a thing and I learned some new skills along the way.

## 2. Build Something Useful

Recently at work, I found myself needing to restart my server after performing a certain kind of build. These sorts of builds are frequent enough to be annoying but not frequent enough to warrant running a watch process and resetting all the time. Especially since I didn't *always* have to reset it depending on which part of the system changed. I got tired of opening a command prompt as an administrator and running the reset command so I wrote a tool to do it for me. Now I just click an icon in my taskbar and everything is taken care of. Or more recently, I decided that transparent windows are awesome and hard to come by in Windows 10. I [wrote a command line tool][1] which lets me change the opacity of almost any window. As of this writing, the tool is not perfect. It doesn't have some of the bells and whistles you'd expect from a full-fledged project and there are cases where the UI kind of breaks. But it works just fine for my use case. It seems really small but it really makes a major impact in my day-to-day happiness and it feels extra nice when I run it since I know I wrote it.

So what's something you would want to write? It could be something very simple like the tools I mentioned before. It could be something more involved. I've worked on a number of small games and as such, I wanted maps. So rather than use an existing map maker and manipulate the output to fit my game, I just whipped up a map maker of my own. Look for something like this for yourself. What is a tool that could help you out day-to-day or even just help with a problem for a little while? Working with something you've written to get actual work done is awesome.

## 3. Pump Up Your Resume

For those of you looking to boost your resume, I've got a few ideas for you. Ideally, you want to build something that is either technically challenging or thoroughly polished. Both is obviously better.

Technically challenging comes in two major flavors: scope and intensity. Large projects are inevitable and it's incredibly valuable to prove that your work "scales." Sure, you can write a little demo of a news aggregator but can you write one with a login system? Personalized feeds? Themes? Basically, can you make an app or system with a large range of functionality and not produce spaghetti code? It's harder than you think. Building a tech demo is easy because you only have to worry if your one little thing works as intended. Building a project requires you to think about how each of these pieces fit into the system as a whole.

You could also take the intensity route. Forget about making a system with multiple features, you want to make one really tight and focused project. Maybe it's a proof-of-concept for an image filter. It could also be writing a [recursive-descent parser][4] for a small programming language. The idea is that this kind of project should take you about as long as writing a project with a bunch of smaller features but you're really just writing one really complex feature. It forces you out of your comfort zone and shows that you can put your nose to the grind and work intently on one thing for extended periods of time. I can also say from personal experience, working on a parser and everything else that's needed for a compiler is a lot of fun and extremely complex. If you haven't walked that path yet, you're doing yourself a disservice.

There's also something to be said for polishing something up. As [Tom Cargill][12] said:

> The first 90 percent of the code accounts for the first 90 percent of the development time. The remaining 10 percent of the code accounts for the other 90 percent of the development time.

Actually truly finishing a project is *hard*. I'd go so far as to say that finishing a project is harder than actually writing the project in the first place. Personally, I have a lot of trouble going back and polishing a project after I've got all of the functionality there. Sure, the UI is cumbersome and some of the text doesn't make sense anymore and, oh yeah, the error messages look like garbage but hey, it works for me, right? Yeah... So pick something that you can already write all of the features for and really make it shine. Maybe you have a mostly finished project already sitting on your hard drive somewhere that you could give the cleanup treatment. Imagine you're actually intending to sell this thing as a project. What kind of things would irk users? Give the program a natural flow. If it has a GUI, make everything very obvious. Don't force the user to spend a lot of time configuring things. If it's a terminal application, make sure the flags make sense. In both cases, give helpful messages when things inevitably go wrong. Really try to make this thing sparkle.

## 4. Make Something Great

This ones the last on the list because it's the least likely that you'll finish it. Ever had a grand idea of something that will change everything? Or at the very least, something way outside of the size of things you've built previously? For me, this was an [MMO][14]. I started working on an MMO years before I knew anything about networking, load balancing, or even really anything about game development. I can tell you that I've never finished, or even come close to finishing, an MMO. But I did learn *a lot* along the way. I learned about how to architect games, how to render a scene efficiently, and a multitude of other skills that have translated to everything I do as a developer. I never finished my **great** project but, who knows? Maybe you'll finish yours. I'm probably just too lazy ;). Even if you don't, you'll learn a lot along the way.

[1]: https://github.com/MCluck90/win-opacity
[2]: https://en.wikipedia.org/wiki/Isometric_graphics_in_video_games_and_pixel_art
[3]: https://en.wikipedia.org/wiki/Video_game_graphics#Top-down_perspective
[4]: https://en.wikipedia.org/wiki/Recursive_descent_parser
[5]: https://en.wikipedia.org/wiki/Binary_tree
[6]: https://en.wikipedia.org/wiki/Quadtree
[7]: https://en.wikipedia.org/wiki/Hash_table
[8]: https://en.wikipedia.org/wiki/Rope_(data_structure)
[9]: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
[10]: https://en.wikipedia.org/wiki/Flood_fill
[11]: https://en.wikipedia.org/wiki/Levenshtein_distance
[12]: https://en.wikipedia.org/wiki/Ninety-ninety_rule
[13]: https://en.wikipedia.org/wiki/Text-based_game
[14]: https://en.wikipedia.org/wiki/Massively_multiplayer_online_game
