import User from '../auth/models/User';

class UserService {
    async getTopUsers(): Promise<{ topUsers: { _id: string, username: string, xp: number }[] }> {
        try {
            const users = await User.find().sort({ xp: -1 }).limit(10);
            const topUsers: { topUsers: { _id: string, username: string, xp: number }[] } = {
                topUsers: []
            };

            users.forEach((user: any) => {
                topUsers.topUsers.push({
                    _id: user._id.toString(),
                    username: user.username,
                    xp: user.xp
                });
            });

            return topUsers;
        } catch (err) {
            console.error('Error getting top users:', err);
            throw err;
        }
    }
}

export default UserService;
