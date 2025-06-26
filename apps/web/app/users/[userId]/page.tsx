interface UserIdPageProps {
    params : {
        userId : string
    }
}

const Page = ({
    params
}:UserIdPageProps) => {
    return (
        <div>
            UserId Page: {params.userId}
        </div>
    )
}

export default Page