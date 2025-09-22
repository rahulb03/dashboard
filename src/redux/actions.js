import { changePassword, getProfile, login, logout, updateProfile } from "./auth/authThunks"

const actions = {
    // auth section ------------
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    // ------------

}

export default actions