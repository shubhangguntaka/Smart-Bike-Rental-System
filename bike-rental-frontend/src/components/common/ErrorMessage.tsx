interface Props {

    message?: string;

}

const ErrorMessage = ({

    message

}: Props) => {

    if (!message) {

        return null;

    }

    return (

        <p className="mt-1 text-sm text-destructive">

            {message}

        </p>

    )

}

export default ErrorMessage;