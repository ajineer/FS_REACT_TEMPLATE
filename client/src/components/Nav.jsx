import { NavLink } from "react-router-dom";


function Nav({user, logout}){

    return (
        <section>
            {user?
            <>
                <NavLink to={'/'} exact='true'>
                    Home
                </NavLink>
                <button onClick={()=> logout()}>Logout</button>
            </>:
            <>
                <NavLink to={'/signup'}>
                    Sign up
                </NavLink>
                <NavLink to={'/login'} exact='true'>
                    Login
                </NavLink>
            </>}
        </section>
    )
}

export default Nav