class Singleton<T>
{
    protected static _instance: any;
    public static getIns (): any
    {
        let Class = this;
        if ( !Class._instance )
            Class._instance = new Class();
        return Class._instance;
    }

    constructor ()
    {
        // console.error( "该类为单例模式！不允许实例化使用！" );
    }
}