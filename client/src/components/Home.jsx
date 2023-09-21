function Home({user}){

    return (
        <section>
            {user?
                <h2>Welcome {user.username}!</h2>:
                <h2>Welcome!</h2>}
        </section>
        
    )
}

export default Home