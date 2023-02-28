const Comments = require('../models/Comment')

module.exports = {
    createComment: async (req, res) => {
        try{
            await Comments.create({
                comment: req.body.comment,
                likes: 0,
                likesArr: [],
                user: req.user.id,
                post: req.params.id,
            })
        } catch (err){
            console.error(err)
        }
        console.log('Comment added')
        res.redirect(`/post/${req.params.id}`)
    },
    likeComment: async (req, res) => {
        try{
            const comment = await Comments.find({_id: req.params.id})
            const likesArr = comment[0].likesArr
            if(likesArr.includes(req.user.id)){
                await Comments.findOneAndUpdate({_id: req.params.id},
                    {
                        $inc: {likes: -1},
                        $pull: {likesArr: req.user.id},
                    })
                console.log('Like removed')
            } else {
                await Comments.findOneAndUpdate({_id: req.params.id},
                {
                    $inc: {'likes': 1},
                    $push: {'likesArr': req.user.id}
                })
                console.log('like added')
            }
            res.redirect(`/post/${comment[0].post}`)
        } catch(err){
            console.error(err)
        }
    },
    deleteComment: async(req, res) => {
        try{
            const comment = await Comments.find({_id: req.params.id})
            const post = String(comment[0].post)
            await Comments.remove({_id: req.params.id})
            console.log('deleted comment')
            res.redirect(`/post/${post}`)
        }catch (err){
            console.error(err)
        }
    }
}