
const loadash = require ("lodash")

const dummy = (blogs) => {
    
    return 1

  }

function totalLikes(blogs) {

 return  blogs.reduce((prev,currentBlog) => {

    return prev + currentBlog.likes
  },0)

}


function favoriteBlog (blogs) {

 let likes= blogs.map((blog) => {
    return blog.likes
  })
  let max = Math.max(... likes)

  let favorite = blogs.find((blog) => {
    return blog.likes === max
  })

  return favorite

}

function mostBlogs (blogs){

  
 let obj= loadash.groupBy(blogs , "author")

 let list = []
 for (const author in obj) {
  if (Object.hasOwnProperty.call(obj, author)) {
    const blogsMadeByThisAuthor = obj[author];
    let blogsQuantity = blogsMadeByThisAuthor.length
    list.push({"author": author , "blogs":blogsQuantity})
    
  }
 }
 let sortedList = loadash.sortBy(list, "blogs")
 let result = sortedList[sortedList.length - 1]
  
 return result

  

}


function mostLikes (blogs){

  
  let obj= loadash.groupBy(blogs , "author")
 
  let list = []
  for (const author in obj) {
   if (Object.hasOwnProperty.call(obj, author)) {
     const blogsMadeByThisAuthor = obj[author];
     let likes = loadash.sumBy(blogsMadeByThisAuthor,"likes")
     console.log(likes)
    
     list.push({"author": author , "likes":likes})
     
   }
  }
  let sortedList = loadash.sortBy(list, "blogs")
  let result = sortedList[sortedList.length - 1]
   
  return result
 
   
 
 }
 



  module.exports = {
    dummy, totalLikes, favoriteBlog , mostBlogs , mostLikes
  }